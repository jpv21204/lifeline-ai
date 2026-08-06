import { geminiService } from '../services/gemini.service.js';

export class FollowupAgent {
  constructor() {
    this.name = 'Follow-up Agent';
    this.icon = '📅';
  }

  /**
   * Process follow-up care plan generation using Gemini LLM reasoning.
   */
  async process(inputContext = {}) {
    const healthResult = inputContext.healthResult || {};
    const urgency = inputContext.urgency || healthResult.urgency || 2;
    const symptoms = inputContext.symptoms || healthResult.matchedSymptoms || [];
    const medicines = inputContext.medicines || inputContext.medicineInformation?.medicines || [];
    const uploadedPrescriptions = inputContext.uploadedPrescriptions || [];
    const diagnosis = inputContext.diagnosis || healthResult.possibleConditions || [];
    const age = inputContext.age || inputContext.userProfile?.age || '';
    const chronicConditions = inputContext.chronicConditions || inputContext.existingConditions || inputContext.userProfile?.existingConditions || '';
    const allergies = inputContext.allergies || inputContext.userProfile?.allergies || '';

    const fullContext = {
      symptoms,
      medicines,
      uploadedPrescriptions,
      diagnosis,
      age,
      chronicConditions,
      allergies,
      urgency,
      healthResult
    };

    // Query Gemini reasoning layer
    const geminiResult = await geminiService.generateFollowUp(fullContext);
    const plan = geminiResult.followUpPlan || {};

    // Build backward-compatible structure for existing UI components
    const reminders = [];

    (plan.medicineSchedule || []).forEach(m => {
      reminders.push({
        type: 'medication',
        message: `${m.medicine}${m.dosage ? ` (${m.dosage})` : ''} - ${m.instructions || ''}`.trim(),
        timing: m.timing || 'Daily',
        priority: 'high'
      });
    });

    if (plan.nextVisit) {
      reminders.push({
        type: 'appointment',
        message: `Follow-up Visit: ${plan.nextVisit}`,
        timing: plan.nextVisit,
        priority: urgency >= 4 ? 'critical' : 'medium'
      });
    }

    (plan.hydrationReminders || []).forEach(h => {
      reminders.push({ type: 'hydration', message: h, timing: 'Throughout day', priority: 'medium' });
    });

    (plan.restAdvice || []).forEach(r => {
      reminders.push({ type: 'rest', message: r, timing: 'Daily', priority: 'medium' });
    });

    const monitoringAdvice = plan.monitoringChecklist || ['Monitor symptoms daily', 'Record blood pressure & temperature if needed'];
    const nextSteps = [
      `Next Visit: ${plan.nextVisit || 'Within 3-5 days'}`,
      ...(plan.warningSigns || []).slice(0, 2).map(w => `Warning Sign to watch: ${w}`)
    ];
    const preventiveCare = plan.lifestyleRecommendations || ['Maintain balanced diet', 'Get 7-8 hours rest'];

    return {
      // Gemini LLM specific output
      followUpPlan: {
        medicineSchedule: plan.medicineSchedule || [],
        monitoringChecklist: plan.monitoringChecklist || [],
        warningSigns: plan.warningSigns || [],
        nextVisit: plan.nextVisit || 'Within 3-5 days',
        lifestyleRecommendations: plan.lifestyleRecommendations || [],
        vaccinationReminders: plan.vaccinationReminders || [],
        hydrationReminders: plan.hydrationReminders || [],
        restAdvice: plan.restAdvice || []
      },

      // Backward-compatible UI output
      reminders: reminders.slice(0, 6),
      monitoringAdvice: monitoringAdvice.slice(0, 4),
      nextSteps: nextSteps.slice(0, 4),
      preventiveCare: preventiveCare.slice(0, 4)
    };
  }
}
