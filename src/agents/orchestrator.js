import { HealthAgent } from './healthAgent.js';
import { EmergencyAgent } from './emergencyAgent.js';
import { HospitalAgent } from './hospitalAgent.js';
import { SchemeAgent } from './schemeAgent.js';
import { MedicineAgent } from './medicineAgent.js';
import { FollowupAgent } from './followupAgent.js';
import { TranslationAgent } from './translationAgent.js';
import { AnalyticsAgent } from './analyticsAgent.js';
import { geminiService } from '../services/gemini.service.js';

const KNOWLEDGE_BASE = {
  malaria: `### 🩺 Understanding Malaria\n\nMalaria is a life-threatening disease spread by the bite of an infected female Anopheles mosquito. The parasite travels to the liver, matures, and enters the bloodstream, destroying red blood cells.\n\n*   **Symptoms:** High fever, shaking chills, sweating, muscle aches, fatigue, headache, nausea.\n*   **Prevention:**\n    *   Use insecticide-treated bed nets.\n    *   Apply mosquito repellent (DEET or Picaridin).\n    *   Remove stagnant standing water around your home.\n*   **Treatment:** Antimalarial medications (ACTs) prescribed by a doctor. Seek medical assessment immediately if suspected.`,
  dengue: `### 🦟 Dengue Fever Prevention & Care\n\nDengue is a viral infection transmitted to humans through the bite of infected Aedes mosquitoes. It is prevalent in tropical climates.\n\n*   **Symptoms:** Sudden high fever, severe headache (behind the eyes), muscle and joint pains ("breakbone fever"), skin rash, mild bleeding.\n*   **Home Care:** Hydrate extensively (ORS, coconut water), take Paracetamol for fever. Do NOT take Aspirin or Ibuprofen as they increase bleeding risks.\n*   **Warning Signs (Emergency):** Severe abdominal pain, persistent vomiting, bleeding gums, difficulty breathing. Seek emergency care immediately.`,
  fever: `### 🌡️ Fever Management Care Guide\n\nA fever is a temporary increase in body temperature, often due to an illness. It is a sign that your body is fighting off infection.\n\n*   **Adult Care:** Drink plenty of fluids, rest, wear light clothing, use cold compresses, and take Paracetamol (500mg) up to 4 times daily.\n*   **Infant Care:** Seek pediatric assistance immediately if an infant under 3 months has a temperature of 100.4°F (38°C) or higher.\n*   **When to see a Doctor:** Fever > 103°F (39.4°C), fever lasting more than 3 days, or accompanied by neck stiffness, severe headache, confusion, or breathing difficulty.`,
  cough: `### 💨 Cough Relief Guidance\n\nA cough is a natural reflex that clears your airway of irritants and mucus. It can be dry (unproductive) or wet (producing mucus).\n\n*   **Home Remedies:** Warm salt water gargles, herbal tea with honey, steam inhalation, and proper hydration.\n*   **Medication Advice:**\n    *   Dry Cough: Antitussives/cough suppressants.\n    *   Wet Cough: Expectorants to thin mucus.\n*   **When to see a Doctor:** Cough lasting more than 3 weeks, coughing up blood, chest pain, or shortness of breath.`,
  hydration: `### 💧 The Importance of Hydration\n\nStaying hydrated is crucial for maintaining bodily functions, regulating temperature, lubricating joints, and flushing out toxins.\n\n*   **Daily Guidelines:** Aim for 2.5 to 3 liters of water per day.\n*   **Dehydration Symptoms:** Dark urine, dry mouth, extreme fatigue, dizziness, confusion.\n*   **Best Hydrators:** Pure water, herbal teas, coconut water, fresh fruits (watermelon, cucumber). Avoid sugary sodas and excessive caffeine.`
};

const CLINICAL_FAQ = [
  {
    keywords: ['cut', 'bleed', 'wound', 'injury', 'bleeding', 'hand', 'arm', 'leg', 'finger'],
    response: `### 🩹 First Aid for Cuts & Bleeding\nIf you have sustained a cut or minor wound, follow these immediate first-aid steps to prevent infection and promote healing:\n\n1.  **Stop the Bleeding:** Apply direct, firm pressure on the wound using a clean cloth or sterile bandage for several minutes.\n2.  **Clean the Wound:** Rinse the cut under clean, cool running water to remove dirt and debris. Clean the surrounding area gently with mild soap (do not get soap directly in the wound).\n3.  **Disinfect & Protect:** Apply a thin layer of antibiotic ointment (like Bacitracin or Neosporin) and cover the wound with a sterile bandage or gauze.\n4.  **Monitor for Infection:** Watch for redness, swelling, warmth, throbbing pain, or pus.\n\n⚠️ **Seek Emergency Medical Attention If:**\n*   The bleeding is severe or does not stop after 10-15 minutes of direct pressure.\n*   Blood is spurting from the wound (indicates arterial bleeding).\n*   The cut is deep, gaping open, or exposes muscle/fat (may require stitches).\n*   The wound is caused by a rusty or dirty object (risk of tetanus).`
  },
  {
    keywords: ['cpr', 'choke', 'choking', 'seizure', 'seizures', 'unconscious'],
    response: `### 🚨 Critical First Aid Instructions\nFor critical emergencies, follow these protocols immediately:\n\n*   **Cardiopulmonary Resuscitation (CPR):** \n    1. Place the heel of one hand in the center of the chest, and the other hand on top. \n    2. Push hard and fast (100–120 compressions per minute) to a depth of 2 inches.\n    3. Call 108 / 112 immediately.\n*   **Choking (Heimlich Maneuver):**\n    1. Stand behind the person, wrap your arms around their waist.\n    2. Make a fist and place it slightly above their navel.\n    3. Grasp your fist and press hard into their abdomen with quick, upward thrusts.\n*   **Seizure Response:**\n    1. Gently place the person on their side to keep their airway clear.\n    2. Clear the area of hard or sharp objects.\n    3. Do NOT put anything in their mouth or restrict their movement.`
  },
  {
    keywords: ['hypertension', 'blood pressure', 'bp', 'high bp'],
    response: `### 🩺 High Blood Pressure (Hypertension) Guidelines\nHypertension is a condition where the force of blood flowing through your blood vessels is consistently too high.\n\n*   **Symptoms:** Often asymptomatic (referred to as the "silent killer"). Severe cases can cause headaches, fatigue, or nosebleeds.\n*   **Preventative Lifestyle Tips:**\n    1. Limit salt intake (under 1.5 grams/day).\n    2. Follow the DASH diet (high in fruits, vegetables, and low-fat dairy).\n    3. Engage in regular cardio exercise (30 mins daily).\n    4. Manage stress.\n*   **Medication:** Consult a physician for long-term prescriptions (such as Amlodipine, Telmisartan, or Losartan) if lifestyle modifications do not control pressure.`
  },
  {
    keywords: ['diabetes', 'sugar', 'blood sugar', 'insulin'],
    response: `### 🩸 Diabetes & Blood Sugar Management\nDiabetes is a chronic disease where the body cannot produce or use insulin effectively, causing high blood sugar.\n\n*   **Symptoms:** Increased urination, extreme thirst, dry mouth, slow healing wounds, fatigue.\n*   **Care & Nutrition:**\n    1. Restrict processed sugars, white flour, and sweetened sodas.\n    2. Incorporate lean proteins, complex grains (barley, quinoa), and non-starchy vegetables.\n    3. Monitor sugar levels using a glucometer daily (fasting and post-meal).\n*   **Clinical Advice:** Consult an endocrinologist for custom care, oral medications (Metformin), or insulin administration.`
  },
  {
    keywords: ['stomach', 'acid', 'gas', 'gastritis', 'indigestion', 'constipation'],
    response: `### 🤢 Stomach Pain & Gastritis Relief\nStomach ache can be triggered by acid reflux, flatulence, indigestion, or gastroenteritis.\n\n*   **Symptom Relief:**\n    1. Drink lukewarm ginger tea or peppermint water.\n    2. Refrain from consuming carbonated drinks, caffeine, oily foods, and citrus fruits.\n    3. Avoid lying down flat after a meal; keep the head elevated.\n*   **Medications:** Antacids (Digene) or Proton Pump Inhibitors (Pantoprazole, Omeprazole) help block acid production.\n*   **When to see a Doctor:** Severe localized pain (like appendicitis on the lower right), high fever, vomiting blood, or stool containing blood.`
  },
  {
    keywords: ['headache', 'migraine', 'head pain'],
    response: `### 💆 Headache & Migraine Management\nHead pain is typically classified as a tension headache, sinus headache, or migraine (vascular/neurological).\n\n*   **Immediate Relief:**\n    1. Sleep in a dark, silent, cool room.\n    2. Apply a cold gel compress to the neck or forehead.\n    3. Drink water to rule out dehydration.\n*   **OTC Medications:** Paracetamol or Naproxen can relieve pain. Avoid overuse to prevent medication overuse headaches.\n*   **⚠️ High Risk Warning:** A sudden, explosive headache ("thunderclap") requires immediate emergency medical attention.`
  },
  {
    keywords: ['sun', 'heat', 'heat stroke', 'sunburn', 'hot'],
    response: `### ☀️ Heat Stroke & Sunburn First Aid\nProlonged heat exposure can raise core body temperature to dangerous levels.\n\n*   **Heat Exhaustion Treatment:**\n    1. Move the person to an air-conditioned room or shade.\n    2. Sip cool water or rehydration fluids (ORS).\n    3. Apply wet towels to lower body temperature.\n*   **🚨 Heat Stroke Warning (Emergency):** If the person is confused, has hot dry skin, or loses consciousness, call 108 immediately. Cool them with ice packs under armpits and neck.`
  }
];

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

  async process(message, userProfile = {}, setAgentStatuses = () => {}) {
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
    // Conversational Quick Fallback check
    // ==========================================
    const matchedFaq = CLINICAL_FAQ.find(item => 
      item.keywords.some(word => cleanMsg.includes(word))
    );

    if (matchedFaq) {
      let summaryText = matchedFaq.response;
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

    // ==========================================
    // Gemini Intelligent Orchestration Decision
    // ==========================================
    const orchestratorContext = {
      userInput: message,
      userProfile,
      uploadedFiles: userProfile.uploadedFiles || [],
      hasPrescription: /prescription|tablet|medicine|dosage|drug/i.test(message),
      isEmergencyKeywords: /chest pain|heart attack|stroke|not breathing/i.test(message)
    };

    const decision = await geminiService.orchestrateAgents(orchestratorContext);
    const agentsToRun = decision.agentsToRun || [];
    const executionMode = decision.executionMode || 'parallel';

    // Map requested agent names to internal keys
    const shouldRun = (name) => agentsToRun.some(a => 
      a.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(a.toLowerCase())
    );

    // Primary Health Assessment & Emergency Detection
    let healthResult = {};
    let emergencyResult = {};

    const runEmergency = shouldRun('EmergencyAgent') || shouldRun('emergency_detection');
    const runHealth = shouldRun('HealthAssessmentAgent') || shouldRun('health_assessment');

    if (runEmergency) updateStatus('emergency_detection', 'processing');
    if (runHealth) updateStatus('health_assessment', 'processing');

    const [hRes, eRes] = await Promise.all([
      runHealth ? this.healthAgent.process({
        symptoms: message,
        age: userProfile.age,
        gender: userProfile.gender,
        existingConditions: userProfile.existingConditions ? userProfile.existingConditions.split(',').map(c => c.trim()).filter(Boolean) : []
      }) : Promise.resolve({ matchedSymptoms: [], urgency: 2, possibleConditions: [] }),

      runEmergency ? this.emergencyAgent.process({
        userProfile,
        symptoms: message,
        healthResult: null
      }) : Promise.resolve({ isEmergency: false, urgencyLevel: 2 })
    ]);

    healthResult = hRes;
    emergencyResult = eRes;

    if (runHealth) updateStatus('health_assessment', 'complete', 120);
    if (runEmergency) updateStatus('emergency_detection', 'complete', 120);

    results.health_assessment = healthResult;
    results.emergency_detection = emergencyResult;

    // Secondary Agents execution
    const secondaryTasks = [];

    // Hospital Finder Agent
    if (shouldRun('HospitalFinderAgent') || shouldRun('hospital_finder')) {
      updateStatus('hospital_finder', 'processing');
      const start = Date.now();
      const task = this.hospitalAgent.process({
        location: userProfile.location || '',
        specialties: healthResult.specialtiesNeeded || [],
        urgency: healthResult.urgency || emergencyResult.urgencyLevel || 2,
        preferGovt: userProfile.income && (userProfile.income.includes('bpl') || userProfile.income.includes('low'))
      }).then(res => {
        updateStatus('hospital_finder', 'complete', Date.now() - start);
        results.hospital_finder = res;
        return res;
      });
      secondaryTasks.push(task);
    }

    // Government Health Scheme Agent
    if (shouldRun('GovernmentSchemeAgent') || shouldRun('government_scheme')) {
      updateStatus('government_scheme', 'processing');
      const start = Date.now();
      const task = this.schemeAgent.process({
        age: userProfile.age,
        gender: userProfile.gender,
        income: userProfile.income,
        occupation: userProfile.occupation,
        state: userProfile.state || 'Telangana',
        conditions: healthResult.matchedSymptoms ? healthResult.matchedSymptoms.map(s => s.name) : []
      }).then(res => {
        updateStatus('government_scheme', 'complete', Date.now() - start);
        results.government_scheme = res;
        return res;
      });
      secondaryTasks.push(task);
    }

    // Medicine Information Agent disabled per user request
    updateStatus('medicine_info', 'idle');

    if (executionMode === 'parallel') {
      await Promise.all(secondaryTasks);
    } else {
      for (const t of secondaryTasks) await t;
    }

    // Follow-up Agent (Gemini Powered)
    if (shouldRun('FollowupAgent') || shouldRun('followup')) {
      updateStatus('followup', 'processing');
      const start = Date.now();
      results.followup = await this.followupAgent.process({
        healthResult,
        urgency: emergencyResult.urgencyLevel || healthResult.urgency || 2,
        symptoms: message,
        medicines: results.medicine_info?.medicines || [],
        userProfile
      });
      updateStatus('followup', 'complete', Date.now() - start);
    }

    // Analytics Agent
    updateStatus('analytics', 'processing');
    const startAnalytics = Date.now();
    results.analytics = await this.analyticsAgent.process({
      symptoms: healthResult.matchedSymptoms || [],
      location: userProfile.location || 'Unknown',
      age: userProfile.age || 30
    });
    updateStatus('analytics', 'complete', Date.now() - startAnalytics);

    // ==========================================
    // Gemini Personalized Healthcare Action Plan Compilation
    // ==========================================
    const planCompilationContext = {
      message,
      userProfile,
      healthResult,
      emergencyResult,
      hospitalResult: results.hospital_finder,
      schemeResult: results.government_scheme,
      medicineResult: results.medicine_info,
      followupResult: results.followup,
      orchestratorDecision: decision
    };

    const actionPlanResult = await geminiService.generateActionPlan(planCompilationContext);
    let summaryText = actionPlanResult.summary;

    // Translate final output if required
    if (targetLang !== 'en' && (shouldRun('TranslationAgent') || shouldRun('translation'))) {
      updateStatus('translation', 'processing');
      const startTrans = Date.now();
      results.translation = await this.translationAgent.process({
        text: summaryText,
        targetLanguage: targetLang
      });
      updateStatus('translation', 'complete', Date.now() - startTrans);
      summaryText = results.translation.translatedText || summaryText;
    } else {
      updateStatus('translation', 'complete', 10);
      results.translation = { language: targetLang, note: 'Content delivered in target language.' };
    }

    return {
      results,
      orchestratorDecision: decision,
      actionPlan: {
        urgency: emergencyResult.urgencyLevel || healthResult.urgency || 2,
        urgencyLabel: actionPlanResult.urgencyLabel || (emergencyResult.isEmergency ? 'Critical' : 'Low'),
        isEmergency: emergencyResult.isEmergency || false,
        summary: summaryText,
        sections: results
      },
      processingTime: Date.now() - startTime
    };
  }
}
