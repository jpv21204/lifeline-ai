import { HealthAgent } from './healthAgent';
import { EmergencyAgent } from './emergencyAgent';
import { HospitalAgent } from './hospitalAgent';
import { SchemeAgent } from './schemeAgent';
import { MedicineAgent } from './medicineAgent';
import { FollowupAgent } from './followupAgent';
import { TranslationAgent } from './translationAgent';
import { AnalyticsAgent } from './analyticsAgent';

const KNOWLEDGE_BASE = {
  malaria: `### 🩺 Understanding Malaria\n\nMalaria is a life-threatening disease spread by the bite of an infected female Anopheles mosquito. The parasite travels to the liver, matures, and enters the bloodstream, destroying red blood cells.\n\n*   **Symptoms:** High fever, shaking chills, sweating, muscle aches, fatigue, headache, nausea.\n*   **Prevention:**\n    *   Use insecticide-treated bed nets.\n    *   Apply mosquito repellent (DEET or Picaridin).\n    *   Remove stagnant standing water around your home.\n*   **Treatment:** Antimalarial medications (ACTs) prescribed by a doctor. Seek medical assessment immediately if suspected.`,
  
  dengue: `### 🦟 Dengue Fever Prevention & Care\n\nDengue is a viral infection transmitted to humans through the bite of infected Aedes mosquitoes. It is prevalent in tropical climates.\n\n*   **Symptoms:** Sudden high fever, severe headache (behind the eyes), muscle and joint pains ("breakbone fever"), skin rash, mild bleeding.\n*   **Home Care:** Hydrate extensively (ORS, coconut water), take Paracetamol for fever. Do NOT take Aspirin or Ibuprofen as they increase bleeding risks.\n*   **Warning Signs (Emergency):** Severe abdominal pain, persistent vomiting, bleeding gums, difficulty breathing. Seek emergency care immediately.`,
  
  fever: `### 🌡️ Fever Management Care Guide\n\nA fever is a temporary increase in body temperature, often due to an illness. It is a sign that your body is fighting off infection.\n\n*   **Adult Care:** Drink plenty of fluids, rest, wear light clothing, use cold compresses, and take Paracetamol (500mg) up to 4 times daily.\n*   **Infant Care:** Seek pediatric assistance immediately if an infant under 3 months has a temperature of 100.4°F (38°C) or higher.\n*   **When to see a Doctor:** Fever > 103°F (39.4°C), fever lasting more than 3 days, or accompanied by neck stiffness, severe headache, confusion, or breathing difficulty.`,
  
  cough: `### 💨 Cough Relief Guidance\n\nA cough is a natural reflex that clears your airway of irritants and mucus. It can be dry (unproductive) or wet (producing mucus).\n\n*   **Home Remedies:** Warm salt water gargles, herbal tea with honey, steam inhalation, and proper hydration.\n*   **Medication Advice:**\n    *   Dry Cough: Antitussives/cough suppressants.\n    *   Wet Cough: Expectorants to thin mucus.\n*   **When to see a Doctor:** Cough lasting more than 3 weeks, coughing up blood, chest pain, or shortness of breath.`,
  
  hydration: `### 💧 The Importance of Hydration\n\nStaying hydrated is crucial for maintaining bodily functions, regulating temperature, lubricating joints, and flushing out toxins.\n\n*   **Daily Guidelines:** Aim for 2.5 to 3 liters of water per day.\n*   **Dehydration Symptoms:** Dark urine, dry mouth, extreme fatigue, dizziness, confusion.\n*   **Best Hydrators:** Pure water, herbal teas, coconut water, fresh fruits (watermelon, cucumber). Avoid sugary sodas and excessive caffeine.`
};

function generateActionPlanMarkdown(results, userProfile, isEmergency, urgencyLabel) {
  let md = '';

  if (isEmergency) {
    const em = results.emergency_detection || {};
    md += `### 🚨 **EMERGENCY WARNING**\n`;
    md += `**${em.warningMessage || em.warning || 'Critical emergency condition detected. Immediate response required.'}**\n\n`;
    md += `**Immediate Actions:**\n`;
    if (em.immediateActions || em.emergencyActions) {
      const actions = em.immediateActions || em.emergencyActions;
      actions.forEach(a => { md += `*   🚨 ${a}\n`; });
    } else {
      md += `*   Call 108 / 112 for an emergency ambulance immediately.\n*   Rush to the nearest hospital emergency room.\n`;
    }
    md += `\n`;
  }

  // 1. Health Assessment
  if (results.health_assessment) {
    const ha = results.health_assessment;
    md += `### 🩺 Symptom & Health Assessment\n`;
    md += `*   **Urgency Level:** ${urgencyLabel} Urgency\n`;
    if (ha.possibleConditions && ha.possibleConditions.length > 0) {
      md += `*   **Possible Conditions:** ${ha.possibleConditions.join(', ')}\n`;
    }
    if (ha.selfCare && ha.selfCare.length > 0) {
      md += `*   **Care Instructions:**\n`;
      ha.selfCare.forEach(c => { md += `    *   ${c}\n`; });
    }
    if (ha.seekCareIf && ha.seekCareIf.length > 0) {
      md += `*   **Precautions (Seek immediate care if):**\n`;
      ha.seekCareIf.forEach(c => { md += `    *   ⚠️ ${c}\n`; });
    }
    md += `\n`;
  }

  // 2. Hospital Finder
  if (results.hospital_finder && results.hospital_finder.hospitals && results.hospital_finder.hospitals.length > 0) {
    const hf = results.hospital_finder;
    md += `### 🏥 Recommended Local Facilities (${hf.isAgenticSearch ? 'Live Web Search 🌐' : 'Local Registry'})\n`;
    hf.hospitals.slice(0, 3).forEach(h => {
      const isGovt = h.type?.toLowerCase() === 'government' || h.type?.toLowerCase() === 'phc';
      md += `*   **${h.name}** (${isGovt ? 'Government' : 'Private'})\n`;
      md += `    *   📍 Address: ${h.address}\n`;
      if (h.phone) md += `    *   📞 Phone: ${h.phone}\n`;
      md += `    *   ⭐ Rating: ${h.rating || 'N/A'} / 5 | 🛏️ Beds: ${h.beds || 'N/A'}\n`;
    });
    md += `\n`;
  }

  // 3. Medicine Info
  if (results.medicine_info && (results.medicine_info.medicines || results.medicine_info.relevantMedicines)) {
    const med = results.medicine_info;
    const medicines = med.medicines || med.relevantMedicines || [];
    if (medicines.length > 0) {
      md += `### 💊 Medicine Guidelines & Alternatives\n`;
      medicines.slice(0, 2).forEach(m => {
        md += `*   **${m.name || m.genericName}**\n`;
        if (m.usage) md += `    *   Usage: ${m.usage}\n`;
        if (m.dosage || m.dosageInfo) md += `    *   Dosage: ${m.dosage || m.dosageInfo}\n`;
        if (m.warning) md += `    *   ⚠️ Warning: ${m.warning}\n`;
      });
      md += `\n`;
    }
  }

  // 4. Schemes Info
  if (results.government_scheme && (results.government_scheme.schemes || results.government_scheme.eligibleSchemes)) {
    const gs = results.government_scheme;
    const schemes = gs.schemes || gs.eligibleSchemes || [];
    if (schemes.length > 0) {
      md += `### 📋 Government Health Schemes\n`;
      schemes.slice(0, 2).forEach(s => {
        md += `*   **${s.name}**\n`;
        if (s.coverage || s.coverageAmount) md += `    *   Benefit: Coverage of ${s.coverage || s.coverageAmount}\n`;
        if (s.eligibility) md += `    *   Eligibility: ${s.eligibility.incomeLimit || s.eligibility}\n`;
      });
      md += `\n`;
    }
  }

  // 5. Followup Care
  if (results.followup && (results.followup.reminders || results.followup.monitoringAdvice)) {
    const fo = results.followup;
    const reminders = fo.reminders || fo.monitoringAdvice || [];
    if (reminders.length > 0) {
      md += `### 📅 Monitoring & Follow-up\n`;
      reminders.slice(0, 3).forEach(r => {
        md += `*   ${r.action || r.message || r} (${r.when || r.timing || 'Immediate'})\n`;
      });
      md += `\n`;
    }
  }

  return md.trim();
}

export class Orchestrator {
  constructor() {
    this.healthAgent = new HealthAgent();
    this.emergencyAgent = new EmergencyAgent();
    this.hospitalAgent = new HospitalAgent();
    this.schemeAgent = new SchemeAgent();
    this.medicineAgent = new MedicineAgent();
    this.followupAgent = new FollowupAgent();
    this.translationAgent = new TranslationAgent();
    this.analyticsAgent = new AnalyticsAgent();
  }

  async process(message, userProfile, setAgentStatuses = () => {}) {
    const startTime = Date.now();
    const results = {};
    const targetLang = userProfile.language || 'en';

    const updateStatus = (agentId, status, time = null) => {
      setAgentStatuses(prev => ({
        ...prev,
        [agentId]: { status, time }
      }));
    };

    const cleanMsg = message.toLowerCase().trim();

    // ==========================================
    // ROUTE 0: Conversational Knowledge Base
    // ==========================================
    const foundKeyword = Object.keys(KNOWLEDGE_BASE).find(key => cleanMsg.includes(key));
    if (foundKeyword && (cleanMsg.startsWith('what is') || cleanMsg.startsWith('explain') || cleanMsg.includes('prevent') || cleanMsg.includes('tips for') || cleanMsg.includes('how to') || cleanMsg.endsWith('?'))) {
      let summaryText = KNOWLEDGE_BASE[foundKeyword];
      
      updateStatus('translation', 'complete', 10);
      updateStatus('analytics', 'complete', 10);
      
      if (targetLang !== 'en') {
        updateStatus('translation', 'processing');
        const translationResult = await this.translationAgent.process({
          text: summaryText,
          targetLanguage: targetLang
        });
        updateStatus('translation', 'complete', 50);
        summaryText = translationResult.translatedText || summaryText;
      }

      return {
        results: { general_info: { text: summaryText } },
        actionPlan: {
          urgency: 2,
          urgencyLabel: 'Low',
          isEmergency: false,
          summary: summaryText,
          sections: { general_info: { text: summaryText } }
        },
        processingTime: Date.now() - startTime
      };
    }

    // Classify user intent dynamically (Agent Router Pattern)
    const isHospitalQuery = /\b(hospital|hospitals|clinic|clinics|doctor|doctors|dispensary|phc|chc|medical center|health center)\b/.test(cleanMsg) || 
                            cleanMsg.includes('near me') || 
                            cleanMsg.includes('chittor') || 
                            cleanMsg.includes('tirupati') ||
                            cleanMsg.includes('warangal') ||
                            cleanMsg.includes('karimnagar') ||
                            cleanMsg.includes('chittoor');

    const isMedicineQuery = /\b(medicine|medicines|drug|drugs|tablet|tablets|syrup|dosage|paracetamol|side effect|effects of)\b/.test(cleanMsg);
    const isSchemeQuery = /\b(scheme|schemes|yojana|pmjay|ayushman|eligibility|eligible|benefit|benefits|government health)\b/.test(cleanMsg);

    // ==========================================
    // ROUTE 1: Pure Hospital Finder Web Search
    // ==========================================
    if (isHospitalQuery && !isMedicineQuery && !isSchemeQuery) {
      updateStatus('hospital_finder', 'processing');
      
      let matchedLocation = userProfile.location || '';
      const inMatch = message.match(/in\s+([A-Za-z\s]+)/i);
      const nearMatch = message.match(/near\s+([A-Za-z\s]+)/i);
      
      if (inMatch && inMatch[1]) {
        matchedLocation = inMatch[1].trim();
      } else if (nearMatch && nearMatch[1]) {
        matchedLocation = nearMatch[1].trim();
      }

      const hospitalStart = Date.now();
      const hospitalResult = await this.hospitalAgent.process({
        location: matchedLocation,
        specialties: [],
        urgency: 2,
        preferGovt: userProfile.income && (userProfile.income.includes('bpl') || userProfile.income.includes('low'))
      });
      const hospitalElapsed = Date.now() - hospitalStart;
      updateStatus('hospital_finder', 'complete', hospitalElapsed);
      results.hospital_finder = hospitalResult;

      let summaryText = generateActionPlanMarkdown(results, userProfile, false, 'Low');
      
      if (targetLang !== 'en') {
        updateStatus('translation', 'processing');
        const translationStart = Date.now();
        const translationResult = await this.translationAgent.process({
          text: summaryText,
          targetLanguage: targetLang
        });
        updateStatus('translation', 'complete', Date.now() - translationStart);
        results.translation = translationResult;
        summaryText = translationResult.translatedText || summaryText;
      }

      return {
        results,
        actionPlan: {
          urgency: 2,
          urgencyLabel: 'Low',
          isEmergency: false,
          summary: summaryText,
          sections: results
        },
        processingTime: Date.now() - startTime
      };
    }

    // ==========================================
    // ROUTE 2: Pure Medicine Information Query
    // ==========================================
    if (isMedicineQuery && !isHospitalQuery && !isSchemeQuery) {
      updateStatus('medicine_info', 'processing');

      const medicineStart = Date.now();
      const medicineResult = await this.medicineAgent.process({
        conditions: [],
        symptoms: [message]
      });
      const medicineElapsed = Date.now() - medicineStart;
      updateStatus('medicine_info', 'complete', medicineElapsed);
      results.medicine_info = medicineResult;

      let summaryText = generateActionPlanMarkdown(results, userProfile, false, 'Low');
      
      if (targetLang !== 'en') {
        updateStatus('translation', 'processing');
        const translationStart = Date.now();
        const translationResult = await this.translationAgent.process({
          text: summaryText,
          targetLanguage: targetLang
        });
        updateStatus('translation', 'complete', Date.now() - translationStart);
        results.translation = translationResult;
        summaryText = translationResult.translatedText || summaryText;
      }

      return {
        results,
        actionPlan: {
          urgency: 2,
          urgencyLabel: 'Low',
          isEmergency: false,
          summary: summaryText,
          sections: results
        },
        processingTime: Date.now() - startTime
      };
    }

    // ==========================================
    // ROUTE 3: Pure Government Health Scheme Query
    // ==========================================
    if (isSchemeQuery && !isHospitalQuery && !isMedicineQuery) {
      updateStatus('government_scheme', 'processing');

      const schemeStart = Date.now();
      const schemeResult = await this.schemeAgent.process({
        age: userProfile.age,
        gender: userProfile.gender,
        income: userProfile.income,
        occupation: userProfile.occupation,
        state: userProfile.state || 'Telangana',
        conditions: []
      });
      const schemeElapsed = Date.now() - schemeStart;
      updateStatus('government_scheme', 'complete', schemeElapsed);
      results.government_scheme = schemeResult;

      let summaryText = generateActionPlanMarkdown(results, userProfile, false, 'Low');
      
      if (targetLang !== 'en') {
        updateStatus('translation', 'processing');
        const translationStart = Date.now();
        const translationResult = await this.translationAgent.process({
          text: summaryText,
          targetLanguage: targetLang
        });
        updateStatus('translation', 'complete', Date.now() - translationStart);
        results.translation = translationResult;
        summaryText = translationResult.translatedText || summaryText;
      }

      return {
        results,
        actionPlan: {
          urgency: 2,
          urgencyLabel: 'Low',
          isEmergency: false,
          summary: summaryText,
          sections: results
        },
        processingTime: Date.now() - startTime
      };
    }

    // ==========================================
    // ROUTE 3.5: Conversational Fallback Query
    // ==========================================
    const isGeneralQuestion = /\b(why|what|how|who|tell|explain|tips|prevent|cure|advice|hello|hi|hey)\b/.test(cleanMsg) || cleanMsg.endsWith('?');
    if (isGeneralQuestion) {
      let summaryText = `### 🩺 Conversational Health Information\n\nI am LifeLine AI, your conversational healthcare assistant. I can help analyze symptoms, locate local hospitals, evaluate scheme eligibility, and provide generic medicine guidelines.\n\nTo help me assist you, could you please specify:\n1.  **Your specific symptoms** (e.g. fever, headache, dry cough)?\n2.  **Duration** of symptoms (how many days)?\n3.  **Your location** to find nearby clinics?\n\n*Please note: I am an AI assistant for guidance. Always consult a certified healthcare professional for medical diagnoses.*`;
      
      updateStatus('translation', 'complete', 10);
      updateStatus('analytics', 'complete', 10);

      if (targetLang !== 'en') {
        updateStatus('translation', 'processing');
        const translationResult = await this.translationAgent.process({
          text: summaryText,
          targetLanguage: targetLang
        });
        updateStatus('translation', 'complete', 50);
        summaryText = translationResult.translatedText || summaryText;
      }

      return {
        results: { general_info: { text: summaryText } },
        actionPlan: {
          urgency: 2,
          urgencyLabel: 'Low',
          isEmergency: false,
          summary: summaryText,
          sections: { general_info: { text: summaryText } }
        },
        processingTime: Date.now() - startTime
      };
    }

    // ==========================================================
    // ROUTE 4: Full Multi-Agent Clinical Diagnosis & Pipeline
    // ==========================================================
    updateStatus('health_assessment', 'processing');
    updateStatus('emergency_detection', 'processing');

    const healthStart = Date.now();
    const emergencyStart = Date.now();

    const [healthResult, emergencyResult] = await Promise.all([
      this.healthAgent.process({
        symptoms: message,
        age: userProfile.age,
        gender: userProfile.gender,
        existingConditions: userProfile.existingConditions ? userProfile.existingConditions.split(',').map(c => c.trim()).filter(Boolean) : []
      }).then(res => {
        const elapsed = Date.now() - healthStart;
        updateStatus('health_assessment', 'complete', elapsed);
        results.health_assessment = res;
        return res;
      }),
      this.emergencyAgent.process({
        symptoms: message,
        healthResult: null
      }).then(res => {
        const elapsed = Date.now() - emergencyStart;
        updateStatus('emergency_detection', 'complete', elapsed);
        results.emergency_detection = res;
        return res;
      })
    ]);

    if (healthResult.urgency >= 4 && !emergencyResult.isEmergency) {
      emergencyResult.isEmergency = true;
      emergencyResult.severity = 'high';
      emergencyResult.warningMessage = '⚠️ Health assessment suggests high urgency. Immediate medical attention recommended.';
    }

    const tasks = [];

    // Hospital Finder Agent
    updateStatus('hospital_finder', 'processing');
    const hospitalStart = Date.now();
    const hospitalTask = this.hospitalAgent.process({
      location: userProfile.location || '',
      specialties: healthResult.specialtiesNeeded || [],
      urgency: healthResult.urgency,
      preferGovt: userProfile.income && (userProfile.income.includes('bpl') || userProfile.income.includes('low'))
    }).then(res => {
      const elapsed = Date.now() - hospitalStart;
      updateStatus('hospital_finder', 'complete', elapsed);
      results.hospital_finder = res;
      return res;
    });
    tasks.push(hospitalTask);

    // Government Scheme Agent
    updateStatus('government_scheme', 'processing');
    const schemeStart = Date.now();
    const schemeTask = this.schemeAgent.process({
      age: userProfile.age,
      gender: userProfile.gender,
      income: userProfile.income,
      occupation: userProfile.occupation,
      state: userProfile.state || 'Telangana',
      conditions: healthResult.matchedSymptoms ? healthResult.matchedSymptoms.map(s => s.name) : []
    }).then(res => {
      const elapsed = Date.now() - schemeStart;
      updateStatus('government_scheme', 'complete', schemeElapsed);
      results.government_scheme = res;
      return res;
    });
    tasks.push(schemeTask);

    // Medicine Information Agent
    updateStatus('medicine_info', 'processing');
    const medicineStart = Date.now();
    const medicineTask = this.medicineAgent.process({
      conditions: healthResult.possibleConditions || [],
      symptoms: healthResult.matchedSymptoms ? healthResult.matchedSymptoms.map(s => s.name) : []
    }).then(res => {
      const elapsed = Date.now() - medicineStart;
      updateStatus('medicine_info', 'complete', medicineElapsed);
      results.medicine_info = res;
      return res;
    });
    tasks.push(medicineTask);

    await Promise.all(tasks);

    // Follow-up Agent
    updateStatus('followup', 'processing');
    const followupStart = Date.now();
    results.followup = await this.followupAgent.process({
      healthResult,
      urgency: healthResult.urgency
    }).then(res => {
      const elapsed = Date.now() - followupStart;
      updateStatus('followup', 'complete', elapsed);
      return res;
    });

    // Analytics Agent
    updateStatus('analytics', 'processing');
    const analyticsStart = Date.now();
    results.analytics = await this.analyticsAgent.process({
      symptoms: healthResult.matchedSymptoms || [],
      location: userProfile.location || 'Unknown',
      age: userProfile.age || 30
    }).then(res => {
      const elapsed = Date.now() - analyticsStart;
      updateStatus('analytics', 'complete', elapsed);
      return res;
    });

    // Translation Agent
    let summaryText = generateActionPlanMarkdown(results, userProfile, emergencyResult.isEmergency, healthResult.urgencyLabel);

    if (targetLang !== 'en') {
      updateStatus('translation', 'processing');
      const translationStart = Date.now();
      results.translation = await this.translationAgent.process({
        text: summaryText,
        targetLanguage: targetLang
      }).then(res => {
        const elapsed = Date.now() - translationStart;
        updateStatus('translation', 'complete', elapsed);
        return res;
      });
      summaryText = results.translation.translatedText || summaryText;
    } else {
      updateStatus('translation', 'complete', 20);
      results.translation = { language: 'en', note: 'English language selected.' };
    }

    return {
      results,
      actionPlan: {
        urgency: healthResult.urgency,
        urgencyLabel: healthResult.urgencyLabel,
        isEmergency: emergencyResult.isEmergency,
        summary: summaryText,
        sections: results
      },
      processingTime: Date.now() - startTime
    };
  }
}
