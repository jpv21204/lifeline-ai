import { HealthAgent } from './healthAgent';
import { EmergencyAgent } from './emergencyAgent';
import { HospitalAgent } from './hospitalAgent';
import { SchemeAgent } from './schemeAgent';
import { MedicineAgent } from './medicineAgent';
import { FollowupAgent } from './followupAgent';
import { TranslationAgent } from './translationAgent';
import { AnalyticsAgent } from './analyticsAgent';

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
    
    // Classify user intent dynamically (Agent Router Pattern)
    const isHospitalQuery = /\b(hospital|hospitals|clinic|clinics|doctor|doctors|dispensary|phc|chc|medical center|health center)\b/.test(cleanMsg) || 
                            cleanMsg.includes('near me') || 
                            cleanMsg.includes('chittor') || 
                            cleanMsg.includes('tirupati') ||
                            cleanMsg.includes('warangal') ||
                            cleanMsg.includes('karimnagar');

    const isMedicineQuery = /\b(medicine|medicines|drug|drugs|tablet|tablets|syrup|dosage|paracetamol|side effect|effects of)\b/.test(cleanMsg);
    const isSchemeQuery = /\b(scheme|schemes|yojana|pmjay|ayushman|eligibility|eligible|benefit|benefits|government health)\b/.test(cleanMsg);

    // ==========================================
    // ROUTE 1: Pure Hospital Finder Web Search
    // ==========================================
    if (isHospitalQuery && !isMedicineQuery && !isSchemeQuery) {
      updateStatus('hospital_finder', 'processing');
      
      // Extract location from query (e.g. "hospitals in Chittoor" -> "Chittoor")
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

      // Handle Translation if requested
      let summaryText = `🔍 Live Web Search: Located nearby healthcare facilities in ${matchedLocation || 'your region'}.`;
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

      // Trigger analytics asynchronously
      await this.analyticsAgent.process({
        symptoms: ['hospital_search'],
        location: matchedLocation || 'Unknown',
        age: userProfile.age || 30
      });

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

      let summaryText = `💊 Medicine Agent: Retrieved generic drug guidelines and safety information.`;
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

      let summaryText = `📋 Scheme Agent: Evaluated eligibility metrics for government medical subsidies.`;
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
      updateStatus('government_scheme', 'complete', elapsed);
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
      updateStatus('medicine_info', 'complete', elapsed);
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
    let summaryText = emergencyResult.isEmergency
      ? emergencyResult.warningMessage
      : `Based on your symptoms, this appears to be a ${healthResult.urgencyLabel} urgency condition. Here is your personalized health action plan.`;

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
