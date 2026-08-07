import { geminiService } from '../services/gemini.service.js';

export class HealthAgent {
  constructor() {
    this.name = 'Health Assessment Agent';
    this.icon = '🩺';
  }

  async process({ symptoms, age, gender, existingConditions = [] }) {
    const text = (symptoms || '').trim();

    // Call Gemini LLM Health Assessment Reasoning
    const geminiAssessment = await geminiService.generateHealthAssessment({
      symptoms: text,
      age,
      gender,
      existingConditions
    });

    // If Gemini provided valid conditions, return them directly
    if (geminiAssessment && geminiAssessment.possibleConditions && geminiAssessment.possibleConditions.length > 0) {
      return geminiAssessment;
    }

    // Fallback: Wikipedia Summary REST API lookup if LLM fails
    let termMatched = 'Fever';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('back')) termMatched = 'Back pain';
    else if (lowerText.includes('knee') || lowerText.includes('joint')) termMatched = 'Joint pain';
    else if (lowerText.includes('headache')) termMatched = 'Headache';
    else if (lowerText.includes('cough')) termMatched = 'Cough';
    else if (lowerText.includes('chest')) termMatched = 'Angina pectoris';

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

    return {
      urgency: 2,
      urgencyLabel: 'Low',
      matchedSymptoms: [{ id: termMatched.toLowerCase().replace(/\s+/g, '_'), name: termMatched, category: 'general' }],
      possibleConditions: [medicalSummary],
      recommendedCareLevel: 'visit-doctor',
      followUpQuestions: ['How long have you experienced these symptoms?'],
      selfCareAdvice: ['Ensure adequate rest', 'Stay hydrated', 'Avoid physical strain'],
      specialtiesNeeded: ['General Medicine'],
      seekCareIf: ['Symptoms worsen progressively']
    };
  }
}
