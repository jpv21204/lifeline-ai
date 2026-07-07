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

    const updateStatus = (agentId, status, time = null) => {
      setAgentStatuses(prev => ({
        ...prev,
        [agentId]: { status, time }
      }));
    };

    // 1. Health Assessment & Emergency Detection run in parallel
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

    // Update emergency agent with health result check
    if (healthResult.urgency >= 4 && !emergencyResult.isEmergency) {
      emergencyResult.isEmergency = true;
      emergencyResult.severity = 'high';
      emergencyResult.warningMessage = '⚠️ Health assessment suggests high urgency. Immediate medical attention recommended.';
    }

    const tasks = [];

    // 2. Hospital Finder Agent
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

    // 3. Government Scheme Agent
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

    // 4. Medicine Information Agent
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

    // Wait for the secondary agents
    await Promise.all(tasks);

    // 5. Follow-up Agent
    updateStatus('followup', 'processing');
    const followupStart = Date.now();
    const followupResult = await this.followupAgent.process({
      healthResult,
      urgency: healthResult.urgency
    }).then(res => {
      const elapsed = Date.now() - followupStart;
      updateStatus('followup', 'complete', elapsed);
      results.followup = res;
      return res;
    });

    // 6. Analytics Agent
    updateStatus('analytics', 'processing');
    const analyticsStart = Date.now();
    const analyticsResult = await this.analyticsAgent.process({
      symptoms: healthResult.matchedSymptoms || [],
      location: userProfile.location || 'Unknown',
      age: userProfile.age || 30
    }).then(res => {
      const elapsed = Date.now() - analyticsStart;
      updateStatus('analytics', 'complete', elapsed);
      results.analytics = res;
      return res;
    });

    // 7. Translation Agent
    const targetLang = userProfile.language || 'en';
    let translationResult = { translatedText: '', note: '' };
    
    if (targetLang !== 'en') {
      updateStatus('translation', 'processing');
      const translationStart = Date.now();
      translationResult = await this.translationAgent.process({
        text: `Personalized Action Plan for ${userProfile.name || 'User'}. Urgency: ${healthResult.urgencyLabel}`,
        targetLanguage: targetLang
      }).then(res => {
        const elapsed = Date.now() - translationStart;
        updateStatus('translation', 'complete', elapsed);
        results.translation = res;
        return res;
      });
    } else {
      updateStatus('translation', 'complete', 50);
      results.translation = { language: 'en', note: 'English language selected.' };
    }

    const processingTime = Date.now() - startTime;

    // Construct Action Plan
    const actionPlan = {
      urgency: healthResult.urgency,
      urgencyLabel: healthResult.urgencyLabel,
      isEmergency: emergencyResult.isEmergency,
      summary: emergencyResult.isEmergency
        ? emergencyResult.warningMessage
        : `Based on your symptoms, this appears to be a ${healthResult.urgencyLabel} urgency condition. Here is your personalized health action plan.`,
      sections: results
    };

    return {
      results,
      actionPlan,
      processingTime
    };
  }
}
