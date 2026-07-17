const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class FollowupAgent {
  constructor() {
    this.name = 'Follow-up Agent';
    this.icon = '📅';
  }

  async process({ healthResult, urgency = 2 }) {
    await delay(400 + Math.random() * 400);

    const reminders = [];
    const monitoringAdvice = [];
    const nextSteps = [];
    const preventiveCare = [];

    const matchedSymptoms = healthResult?.matchedSymptoms || [];
    const careLevel = healthResult?.recommendedCareLevel || 'visit-doctor';

    // Generate reminders based on care level
    if (careLevel === 'emergency') {
      reminders.push(
        { type: 'urgent', message: 'Seek emergency care immediately', timing: 'NOW', priority: 'critical' },
        { type: 'followup', message: 'Follow up with specialist after emergency treatment', timing: 'Within 48 hours', priority: 'high' }
      );
    } else if (careLevel === 'urgent-care') {
      reminders.push(
        { type: 'appointment', message: 'Visit doctor or urgent care center', timing: 'Today', priority: 'high' },
        { type: 'followup', message: 'Follow-up visit if symptoms persist', timing: 'Within 3 days', priority: 'medium' }
      );
    } else if (careLevel === 'visit-doctor') {
      reminders.push(
        { type: 'appointment', message: 'Schedule a doctor appointment', timing: 'Within 2-3 days', priority: 'medium' },
        { type: 'followup', message: 'Follow-up if symptoms worsen', timing: 'Within 1 week', priority: 'medium' }
      );
    } else {
      reminders.push(
        { type: 'monitor', message: 'Monitor symptoms at home', timing: 'Daily', priority: 'low' },
        { type: 'followup', message: 'Visit doctor if symptoms persist beyond 5 days', timing: 'After 5 days', priority: 'low' }
      );
    }

    // Symptom-specific reminders
    const symptomCategories = matchedSymptoms.map(s => s.category);
    const isCardiacEmergency = symptomCategories.includes('cardiac') || urgency >= 4 || healthResult?.severity === 'critical';

    if (symptomCategories.includes('respiratory') && !isCardiacEmergency) {
      reminders.push({ type: 'medication', message: 'Take prescribed respiratory medication', timing: 'As prescribed', priority: 'medium' });
      monitoringAdvice.push('Monitor breathing rate and oxygen levels if possible');
      monitoringAdvice.push('Track fever temperature twice daily');
    }
    if (isCardiacEmergency) {
      reminders.push({ type: 'emergency', message: 'Take emergency aspirin (chewed) if directed by 108 responder', timing: 'Immediately', priority: 'high' });
      monitoringAdvice.push('Monitor blood pressure and pulse rate daily');
      monitoringAdvice.push('Avoid physical exertion and rest in a comfortable position');
    }
    if (symptomCategories.includes('digestive') && !isCardiacEmergency) {
      reminders.push({ type: 'hydration', message: 'Drink ORS solution regularly', timing: 'Every 2 hours', priority: 'medium' });
      monitoringAdvice.push('Track fluid intake and output');
    }
    if (symptomCategories.includes('maternal')) {
      reminders.push(
        { type: 'checkup', message: 'Attend prenatal/postnatal checkup', timing: 'As per schedule', priority: 'high' },
        { type: 'medication', message: 'Take iron and folic acid supplements', timing: 'Daily', priority: 'high' }
      );
      monitoringAdvice.push('Monitor fetal movements daily (in pregnancy)');
      monitoringAdvice.push('Track blood pressure weekly');
    }
    if (symptomCategories.includes('pediatric')) {
      reminders.push(
        { type: 'vaccination', message: 'Check if vaccinations are up to date', timing: 'Next visit', priority: 'medium' },
        { type: 'checkup', message: 'Child health checkup', timing: 'Monthly', priority: 'medium' }
      );
    }
    if (symptomCategories.includes('mental')) {
      reminders.push(
        { type: 'counseling', message: 'Schedule counseling session', timing: 'Weekly', priority: 'medium' },
        { type: 'selfcare', message: 'Practice relaxation exercises', timing: 'Daily', priority: 'medium' }
      );
      monitoringAdvice.push('Track mood and sleep patterns');
      monitoringAdvice.push('Reach out to KIRAN helpline (1800-599-0019) if needed');
    }

    // General monitoring
    if (monitoringAdvice.length === 0) {
      monitoringAdvice.push('Note any new symptoms that develop');
      monitoringAdvice.push('Keep a record of food and water intake');
    }

    // Next steps
    nextSteps.push('Keep all medical documents organized');
    nextSteps.push('Share this action plan with your doctor');
    if (healthResult?.specialtiesNeeded?.length > 0) {
      nextSteps.push(`Consider consulting a ${healthResult.specialtiesNeeded[0]} specialist`);
    }
    nextSteps.push('Update your health profile for better future assessments');

    // Preventive care
    preventiveCare.push('Stay hydrated - drink 8-10 glasses of water daily');
    preventiveCare.push('Maintain a balanced diet with fruits and vegetables');
    preventiveCare.push('Get 7-8 hours of sleep');
    preventiveCare.push('Exercise for at least 30 minutes daily');
    preventiveCare.push('Schedule regular health check-ups');
    preventiveCare.push('Keep vaccinations up to date');

    return {
      reminders: reminders.slice(0, 6),
      monitoringAdvice: monitoringAdvice.slice(0, 4),
      nextSteps: nextSteps.slice(0, 4),
      preventiveCare: preventiveCare.slice(0, 4)
    };
  }
}
