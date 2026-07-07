import symptomsData from '../data/symptoms.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class HealthAgent {
  constructor() {
    this.name = 'Health Assessment Agent';
    this.icon = '🩺';
    this.symptoms = symptomsData;
  }

  async process({ symptoms, age, gender, existingConditions = [] }) {
    await delay(600 + Math.random() * 600);

    const text = (symptoms || '').toLowerCase();
    const matched = [];
    const possibleConditions = new Set();
    const selfCareAdvice = new Set();
    const specialties = new Set();
    let maxUrgency = 1;

    // Match symptoms against database
    for (const s of this.symptoms) {
      const names = [s.name.toLowerCase(), ...s.alternateNames.map(n => n.toLowerCase())];
      const found = names.some(name => text.includes(name)) ||
        text.includes(s.id.replace(/_/g, ' '));

      if (found) {
        matched.push(s);
        let urgency = s.urgencyBase;

        // Check emergency conditions
        for (const ec of s.emergencyIf) {
          if (text.includes(ec.toLowerCase())) {
            urgency = Math.max(urgency, 5);
          }
        }

        // Age adjustments
        if (age && age > 60) urgency = Math.min(urgency + 1, 5);
        if (age && age < 5) urgency = Math.min(urgency + 1, 5);

        // Existing conditions increase urgency
        if (existingConditions.length > 0) {
          const conditions = existingConditions.map(c => c.toLowerCase());
          if (conditions.some(c => ['diabetes', 'heart disease', 'hypertension', 'asthma', 'kidney disease', 'cancer', 'hiv'].includes(c))) {
            urgency = Math.min(urgency + 1, 5);
          }
        }

        maxUrgency = Math.max(maxUrgency, urgency);
        s.commonCauses.forEach(c => possibleConditions.add(c));
        s.selfCare.forEach(c => selfCareAdvice.add(c));
        specialties.add(s.specialtyNeeded);
      }
    }

    // If no symptoms matched, try keyword extraction
    if (matched.length === 0) {
      const keywords = ['pain', 'ache', 'fever', 'cold', 'cough', 'headache', 'stomach', 'vomit',
        'dizziness', 'tired', 'weak', 'rash', 'bleeding', 'pregnant', 'child', 'baby',
        'dard', 'bukhar', 'noppi', 'jwaram'];
      for (const kw of keywords) {
        if (text.includes(kw)) {
          const related = this.symptoms.find(s =>
            s.name.toLowerCase().includes(kw) ||
            s.alternateNames.some(n => n.toLowerCase().includes(kw))
          );
          if (related) {
            matched.push(related);
            maxUrgency = Math.max(maxUrgency, related.urgencyBase);
            related.commonCauses.forEach(c => possibleConditions.add(c));
            related.selfCare.forEach(c => selfCareAdvice.add(c));
            specialties.add(related.specialtyNeeded);
          }
        }
      }
    }

    // Duration parsing (increases urgency)
    const durationMatch = text.match(/(\d+)\s*(day|week|month|din|roz)/i);
    if (durationMatch) {
      const days = parseInt(durationMatch[1]);
      if (durationMatch[2].toLowerCase().includes('week')) {
        if (days >= 2) maxUrgency = Math.min(maxUrgency + 1, 5);
      } else if (days >= 3) {
        maxUrgency = Math.min(maxUrgency + 1, 5);
      }
    }

    // Default if nothing matched
    if (matched.length === 0) {
      return {
        urgency: 2,
        urgencyLabel: 'Medium',
        matchedSymptoms: [],
        possibleConditions: ['General health concern - please describe specific symptoms for a better assessment'],
        recommendedCareLevel: 'visit-doctor',
        followUpQuestions: [
          'Can you describe your symptoms in more detail?',
          'How long have you had these symptoms?',
          'Are you currently taking any medications?',
          'Do you have any pre-existing conditions?'
        ],
        selfCareAdvice: ['Stay hydrated', 'Get adequate rest', 'Monitor your symptoms'],
        specialtiesNeeded: ['General Medicine']
      };
    }

    const urgencyLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High', 5: 'Critical' };
    const careLevels = { 1: 'self-care', 2: 'visit-doctor', 3: 'visit-doctor', 4: 'urgent-care', 5: 'emergency' };

    const followUpQuestions = [];
    if (!age) followUpQuestions.push('What is your age?');
    if (!gender) followUpQuestions.push('What is your gender?');
    if (!durationMatch) followUpQuestions.push('How long have you had these symptoms?');
    if (existingConditions.length === 0) followUpQuestions.push('Do you have any pre-existing conditions like diabetes, BP, or heart disease?');
    if (matched.length > 0) {
      const related = matched[0].relatedSymptoms || [];
      if (related.length > 0) {
        const relatedNames = related.slice(0, 2).map(id => {
          const s = this.symptoms.find(sym => sym.id === id);
          return s ? s.name : id;
        });
        followUpQuestions.push(`Are you also experiencing ${relatedNames.join(' or ')}?`);
      }
    }

    return {
      urgency: maxUrgency,
      urgencyLabel: urgencyLabels[maxUrgency] || 'Medium',
      matchedSymptoms: matched.map(s => ({ id: s.id, name: s.name, category: s.category })),
      possibleConditions: [...possibleConditions].slice(0, 6),
      recommendedCareLevel: careLevels[maxUrgency] || 'visit-doctor',
      followUpQuestions: followUpQuestions.slice(0, 4),
      selfCareAdvice: [...selfCareAdvice].slice(0, 6),
      specialtiesNeeded: [...specialties],
      seekCareIf: matched.flatMap(s => s.seekCareIf).slice(0, 5)
    };
  }
}
