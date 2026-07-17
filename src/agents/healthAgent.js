const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class HealthAgent {
  constructor() {
    this.name = 'Health Assessment Agent';
    this.icon = '🩺';
  }

  async process({ symptoms, age, gender, existingConditions = [] }) {
    await delay(350 + Math.random() * 350);

    const text = (symptoms || '').toLowerCase().trim();
    let maxUrgency = 1;
    let category = 'general';
    let termMatched = 'Fever'; // Default search topic

    // Map keywords to primary medical topics for Wikipedia API lookup
    const topicMap = {
      'chest pain': { term: 'Angina pectoris', cat: 'cardiac', urgency: 5 },
      'heart attack': { term: 'Myocardial infarction', cat: 'cardiac', urgency: 5 },
      'stroke': { term: 'Stroke', cat: 'neurological', urgency: 5 },
      'choking': { term: 'Choking', cat: 'respiratory', urgency: 5 },
      'seizure': { term: 'Seizure', cat: 'neurological', urgency: 5 },
      'unconscious': { term: 'Syncope (medicine)', cat: 'general', urgency: 5 },
      'fever': { term: 'Fever', cat: 'general', urgency: 2 },
      'cough': { term: 'Cough', cat: 'respiratory', urgency: 2 },
      'cold': { term: 'Common cold', cat: 'respiratory', urgency: 1 },
      'headache': { term: 'Headache', cat: 'neurological', urgency: 2 },
      'migraine': { term: 'Migraine', cat: 'neurological', urgency: 3 },
      'stomach': { term: 'Abdominal pain', cat: 'digestive', urgency: 2 },
      'gastritis': { term: 'Gastritis', cat: 'digestive', urgency: 2 },
      'diarrhea': { term: 'Diarrhea', cat: 'digestive', urgency: 2 },
      'vomiting': { term: 'Vomiting', cat: 'digestive', urgency: 2 },
      'asthma': { term: 'Asthma', cat: 'respiratory', urgency: 3 },
      'breathing': { term: 'Shortness of breath', cat: 'respiratory', urgency: 4 },
      'skin rash': { term: 'Rash', cat: 'skin', urgency: 1 },
      'diabetes': { term: 'Diabetes', cat: 'general', urgency: 2 },
      'blood pressure': { term: 'Hypertension', cat: 'cardiac', urgency: 2 },
      'malaria': { term: 'Malaria', cat: 'general', urgency: 3 },
      'dengue': { term: 'Dengue fever', cat: 'general', urgency: 3 }
    };

    // Evaluate matching topic
    for (const [key, val] of Object.entries(topicMap)) {
      if (text.includes(key)) {
        termMatched = val.term;
        category = val.cat;
        maxUrgency = Math.max(maxUrgency, val.urgency);
        break;
      }
    }

    // Dynamic Urgency adjustments
    if (age && (age > 60 || age < 5)) maxUrgency = Math.min(maxUrgency + 1, 5);
    if (existingConditions.length > 0) maxUrgency = Math.min(maxUrgency + 1, 5);
    
    const durationMatch = text.match(/(\d+)\s*(day|week|month)/i);
    if (durationMatch) {
      const days = parseInt(durationMatch[1]);
      if (days >= 3) maxUrgency = Math.min(maxUrgency + 1, 5);
    }

    const urgencyLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Very High', 5: 'Critical' };
    const careLevels = { 1: 'self-care', 2: 'visit-doctor', 3: 'visit-doctor', 4: 'urgent-care', 5: 'emergency' };
    
    // Map categories to medical specialties
    const specialtyMap = {
      cardiac: 'Cardiology',
      respiratory: 'Pulmonology',
      digestive: 'Gastroenterology',
      neurological: 'Neurology',
      skin: 'Dermatology',
      general: 'General Medicine'
    };
    const specialty = specialtyMap[category] || 'General Medicine';

    // Purely Agentic: Retrieve clinical descriptions in real-time from Wikipedia REST summary API
    let medicalSummary = 'A health consultation is recommended to evaluate symptoms.';
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(termMatched)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.extract) {
        medicalSummary = data.extract;
      }
    } catch (err) {
      console.warn("Wikipedia summary fetch failed:", err);
    }

    // Formulate dynamic recommendations
    const selfCareAdvice = [
      'Ensure adequate rest in a well-ventilated space',
      'Maintain strict hydration by sipping clean water frequently',
      'Record symptoms and duration to share with your doctor'
    ];
    if (maxUrgency >= 4) {
      selfCareAdvice.unshift('Sit in a comfortable position and limit all physical movement');
    }

    const seekCareIf = [
      'Symptoms worsen progressively',
      'New localized severe pain develops',
      'Difficulty breathing or chest tightness occurs'
    ];

    const followUpQuestions = [
      'Have you checked your body temperature or vitals recently?',
      'Are you taking any ongoing medications or supplements?'
    ];
    if (!durationMatch) followUpQuestions.push('How many days have you experienced this?');

    return {
      urgency: maxUrgency,
      urgencyLabel: urgencyLabels[maxUrgency] || 'Medium',
      matchedSymptoms: [{ id: termMatched.toLowerCase().replace(/\s+/g, '_'), name: termMatched, category }],
      possibleConditions: [medicalSummary],
      recommendedCareLevel: careLevels[maxUrgency] || 'visit-doctor',
      followUpQuestions: followUpQuestions.slice(0, 3),
      selfCareAdvice: selfCareAdvice,
      specialtiesNeeded: [specialty],
      seekCareIf: seekCareIf
    };
  }
}
