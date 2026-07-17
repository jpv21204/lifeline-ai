import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import translationsData from '../data/translations.json';

const AppContext = createContext(null);

const AGENTS = [
  { id: 'health_assessment', name: 'Health Assessment Agent', emoji: '🩺' },
  { id: 'emergency_detection', name: 'Emergency Detection Agent', emoji: '📞' },
  { id: 'hospital_finder', name: 'Hospital Finder Agent', emoji: '🏥' },
  { id: 'government_scheme', name: 'Government Scheme Agent', emoji: '📋' },
  { id: 'medicine_info', name: 'Medicine Information Agent', emoji: '💊' },
  { id: 'followup', name: 'Follow-up Agent', emoji: '📅' },
  { id: 'translation', name: 'Translation Agent', emoji: '🌐' },
  { id: 'analytics', name: 'Analytics Agent', emoji: '📊' },
];

const initialAgentStatuses = {};
AGENTS.forEach(a => { initialAgentStatuses[a.id] = { status: 'idle', time: null }; });

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const GREETING_RESPONSES = {
  en: "Hello! I am LifeLine AI, your community healthcare assistant. How can I help you today? Please describe your symptoms or health concern, and I will analyze them for you.",
  te: "నమస్కారం! నేను లైఫ్‌లైన్ AI, మీ సామాజిక ఆరోగ్య సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను? మీకు ఎలాంటి లక్షణాలు లేదా ఆరోగ్య సమస్యలు ఉన్నాయో దయచేసి వివరించండి.",
  hi: "नमस्ते! मैं लाइफलाइन AI हूँ, आपका सामुदायिक स्वास्थ्य सहायक। आज मैं आपकी क्या मदद कर सकता हूँ? कृपया अपने लक्षणों या स्वास्थ्य समस्या के बारे में बताएं।",
  ta: "வணக்கம்! நான் லைஃப்லைன் AI, உங்கள் சமூக சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? உங்கள் அறிகுறிகளை அல்லது உடல்நலப் பிரச்சினைகளை விவரிக்கவும்.",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ಲೈಫ್‌ಲೈನ್ AI, ನಿಮ್ಮ ಸಮುದಾಯ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ದಯವಿಟ್ಟು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ವಿವರಿಸಿ.",
  ml: "നമസ്കാരം! ഞാൻ ലൈഫ്‌ലൈൻ AI, നിങ്ങളുടെ കമ്മ്യൂണിറ്റി ആരോഗ്യ സഹായിയാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം? നിങ്ങളുടെ ലക്ഷണങ്ങളോ ആരോഗ്യ പ്രശ്നങ്ങളോ ദയവായി വിവരിക്കുക.",
  bn: "হ্যালো! আমি লাইফলাইন AI, আপনার স্বাস্থ্য সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? অনুগ্রহ করে আপনার উপসর্গ বা স্বাস্থ্য সমস্যাগুলি বলুন।",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਲਾਈਫਲਾਈਨ AI ਹਾਂ, ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ। ਅੱಜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਬਾਰੇ ਦੱਸੋ।",
  mr: "नमस्कार! मी खालीलपैकी लाइफलाईन AI आहे, आपला आरोग्य सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो? कृपया तुमच्या लक्षणांबद्दल सांगा।",
  gu: "નમસ્તે! હું લાઇફલાઇન AI છું, તમારો આરોગ્ય સહાયક. આજે હું તમને કેવી રીતે મદદ કરી શકું? કૃપા કરીને તમારા લક્ષણો વિશે જણાવો.",
  or: "ନମସ୍କାର! ମୁଁ ଲାଇଫଲାଇନ AI, ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ | ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି? ଦୟାକରି ଆପଣଙ୍କର ଲକ୍ଷଣ ବିଷୟରେ କୁହନ୍ତୁ |",
  ur: "سلام! میں لائف لائن AI ہوں، آپ کا صحت کا مددگار۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟ براہ کرم اپنے علامات کے بارے میں بتائیں۔"
};

/* ------------------------------------------------------------------ */
/*  Simulated Orchestrator                                             */
/*  In production this calls ../agents/orchestrator.js — here we mock  */
/*  realistic agent-by-agent processing with delays.                   */
/* ------------------------------------------------------------------ */
async function simulateOrchestrator(userMessage, profile, setAgentStatuses) {
  const results = {};
  const lowerMsg = userMessage.toLowerCase();
  const isEmergency = /chest pain|difficulty breathing|unconscious|heart attack|stroke|bleeding|seizure|accident|not breathing|emergency/i.test(userMessage);
  const isSchemeQuery = /scheme|yojana|eligible|government|benefit|ration|insurance|ayushman|pmjay|janani|amma/i.test(userMessage);
  const isMedicineQuery = /medicine|tablet|drug|paracetamol|ibuprofen|dosage|side effect|amoxicillin|antibiotic|azithromycin/i.test(userMessage);

  const agentOrder = [
    'health_assessment',
    'emergency_detection',
    'hospital_finder',
    'government_scheme',
    'medicine_info',
    'followup',
    'translation',
    'analytics',
  ];

  for (const agentId of agentOrder) {
    setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'processing', time: null } }));
    const start = performance.now();
    await new Promise(r => setTimeout(r, 350 + Math.random() * 450));
    const elapsed = Math.round(performance.now() - start);
    setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'complete', time: elapsed } }));
  }

  /* Build mock results per agent */
  results.health_assessment = {
    symptoms: extractSymptoms(userMessage),
    severity: isEmergency ? 'critical' : 'moderate',
    possibleConditions: isEmergency
      ? ['Acute Coronary Syndrome', 'Myocardial Infarction']
      : ['Upper Respiratory Tract Infection', 'Viral Fever', 'Seasonal Flu'],
    recommendations: isEmergency
      ? ['Call 108 / 112 immediately', 'Do NOT delay hospital visit', 'Keep patient calm and seated upright']
      : ['Rest and hydration', 'Monitor temperature every 4 hours', 'Take prescribed medications on time', 'Visit a doctor if symptoms persist beyond 3 days'],
  };

  results.emergency_detection = {
    isEmergency,
    urgencyLevel: isEmergency ? 'emergency' : (lowerMsg.includes('fever') ? 'moderate' : 'low'),
    emergencyActions: isEmergency ? ['Call 108 ambulance', 'Rush to nearest hospital', 'Administer CPR if needed'] : [],
  };

  results.hospital_finder = {
    hospitals: [
      { name: 'NIMS Hospital', distance: '3.2 km', type: 'Government', contact: '040-27898000', address: 'Punjagutta, Hyderabad', rating: 4.5, emergency: true },
      { name: 'Gandhi Hospital', distance: '5.1 km', type: 'Government', contact: '040-27505566', address: 'Musheerabad, Hyderabad', rating: 4.2, emergency: true },
      { name: 'Osmania General Hospital', distance: '6.8 km', type: 'Government', contact: '040-24600146', address: 'Afzalgunj, Hyderabad', rating: 4.0, emergency: true },
    ],
  };

  results.government_scheme = {
    schemes: isSchemeQuery ? [
      { name: 'Ayushman Bharat (PM-JAY)', eligibility: 'BPL families', coverage: '₹5 lakh per family/year', description: 'Free secondary & tertiary care hospitalization for low-income families.', status: 'Likely Eligible' },
      { name: 'Aarogyasri (Telangana)', eligibility: 'Income < ₹5 lakh/year', coverage: '₹5 lakh per family/year', description: 'Telangana state health insurance for BPL families.', status: 'Likely Eligible' },
      { name: 'Janani Suraksha Yojana', eligibility: 'Pregnant women (BPL)', coverage: '₹1,400 (urban) / ₹700 (rural)', description: 'Cash assistance for institutional delivery.', status: 'Check Eligibility' },
    ] : [
      { name: 'Ayushman Bharat (PM-JAY)', eligibility: 'BPL families', coverage: '₹5 lakh per family/year', description: 'Free secondary & tertiary care hospitalization.', status: 'Check Eligibility' },
    ],
  };

  results.medicine_info = isMedicineQuery ? {
    medicines: [
      { name: 'Paracetamol (500mg)', usage: 'Fever & mild pain relief', dosage: '1-2 tablets every 4-6 hours', sideEffects: ['Nausea', 'Liver damage (overdose)'], warning: 'Do not exceed 4g per day' },
    ],
  } : {
    medicines: [
      { name: 'Paracetamol (500mg)', usage: 'Fever relief', dosage: '1 tablet every 6 hours as needed', sideEffects: ['Rare at normal doses'], warning: 'Consult doctor if fever persists beyond 3 days' },
    ],
  };

  results.followup = {
    reminders: [
      { action: 'Check temperature', when: 'Every 4 hours', priority: 'high' },
      { action: 'Follow-up with doctor', when: 'After 3 days if no improvement', priority: 'medium' },
      { action: 'Blood test (CBC)', when: 'If fever continues beyond 5 days', priority: 'medium' },
    ],
  };

  results.translation = {
    availableLanguages: ['English', 'తెలుగు', 'हिन्दी', 'தமிழ்', 'ಕನ್ನಡ', 'മലയാളം', 'বাংলা', 'ਪੰਜਾਬੀ', 'मराठी', 'ગુજરાતી', 'ଓଡ଼ିଆ', 'اردو'],
    detectedLanguage: 'English',
  };

  results.analytics = {
    queryType: isEmergency ? 'Emergency' : isSchemeQuery ? 'Scheme Inquiry' : isMedicineQuery ? 'Medicine Info' : 'Symptom Assessment',
    responseConfidence: 0.87,
    similarCasesInRegion: Math.floor(Math.random() * 200 + 50),
  };

  /* Build action plan summary */
  const actionPlan = {
    urgency: results.emergency_detection.urgencyLevel,
    isEmergency,
    summary: isEmergency
      ? 'EMERGENCY DETECTED — Immediate medical attention required. Call 108 now.'
      : `Based on your symptoms, this appears to be a ${results.health_assessment.severity} condition. Here is your personalized health action plan.`,
    sections: results,
  };

  return { results, actionPlan };
}

function extractSymptoms(text) {
  const symptomKeywords = ['fever', 'cough', 'cold', 'headache', 'body pain', 'sore throat', 'fatigue', 'nausea', 'vomiting', 'diarrhea', 'chest pain', 'breathlessness', 'difficulty breathing', 'rash', 'swelling', 'dizziness', 'weakness'];
  const found = symptomKeywords.filter(s => text.toLowerCase().includes(s));
  return found.length > 0 ? found : ['general discomfort'];
}

/* ------------------------------------------------------------------ */
export function AppProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [agentStatuses, setAgentStatuses] = useState(initialAgentStatuses);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeline_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '',
      age: '',
      gender: '',
      location: '',
      state: 'Telangana',
      language: 'en',
      income: '',
      occupation: '',
      existingConditions: '',
    };
  });
  const [medicalHistory, setMedicalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeline_medical_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeline_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed && parsed.isLoggedIn === true;
      }
    } catch {}
    return false;
  });
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalQueries: 0,
    avgResponseTime: 0,
    languagesUsed: new Set(['en']),
    emergencyCount: 0,
  });
  const queryCountRef = useRef(0);

  const resetAgentStatuses = useCallback(() => {
    const fresh = {};
    AGENTS.forEach(a => { fresh[a.id] = { status: 'idle', time: null }; });
    setAgentStatuses(fresh);
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isProcessing) return;

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setConversationHistory(prev => [...prev, { role: 'user', content: content.trim() }]);
    setIsProcessing(true);
    resetAgentStatuses();

    const start = performance.now();

    const lowerContent = content.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const greetingWords = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola', 
      'how are you', 'who are you', 'what is this app', 'hii', 'hy', 'yo',
      'నమస్కారం', 'నమస్తే', 'नमस्ते', 'नमस्कार', 'வணக்கம்', 'ನಮಸ್ಕಾರ', 'നമസ്കാരം', 'হ্যালো', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'ਨਮਸતે', 'سلام'
    ];
    const isGreeting = greetingWords.some(w => lowerContent === w || lowerContent.startsWith(w + ' '));

    if (isGreeting) {
      const greetingMsg = GREETING_RESPONSES[currentLanguage] || GREETING_RESPONSES['en'];
      await new Promise(r => setTimeout(r, 450));
      const elapsed = Math.round(performance.now() - start);

      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: greetingMsg,
        timestamp: new Date().toISOString(),
        responseTime: elapsed,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMsg.content }]);
      setIsProcessing(false);
      return;
    }

    try {
      /* Try to import the real orchestrator; fall back to simulation */
      let orchestratorResult;
      try {
        const mod = await import('../agents/orchestrator.js');
        if (mod.Orchestrator) {
          const orc = new mod.Orchestrator();
          orchestratorResult = await orc.process(content.trim(), userProfile, setAgentStatuses);
        } else {
          throw new Error('No Orchestrator export');
        }
      } catch {
        orchestratorResult = await simulateOrchestrator(content.trim(), userProfile, setAgentStatuses);
      }

      const elapsed = Math.round(performance.now() - start);

      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: orchestratorResult.actionPlan?.summary || 'Analysis complete. Please see the action plan below.',
        timestamp: new Date().toISOString(),
        agentResults: orchestratorResult.results,
        actionPlan: orchestratorResult.actionPlan,
        responseTime: elapsed,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMsg.content }]);

      /* Save consultation to medical history */
      const consultation = {
        id: assistantMsg.id,
        timestamp: assistantMsg.timestamp,
        symptoms: content.trim(),
        urgency: orchestratorResult.actionPlan?.urgency || 'unknown',
        summary: orchestratorResult.actionPlan?.summary || '',
        actionPlan: orchestratorResult.actionPlan,
        agentResults: orchestratorResult.results,
        responseTime: elapsed,
      };
      setMedicalHistory(prev => {
        const updated = [...prev, consultation];
        try { localStorage.setItem('lifeline_medical_history', JSON.stringify(updated)); } catch {}
        return updated;
      });

      queryCountRef.current += 1;
      setAnalyticsData(prev => ({
        totalQueries: queryCountRef.current,
        avgResponseTime: Math.round(((prev.avgResponseTime * (queryCountRef.current - 1)) + elapsed) / queryCountRef.current),
        languagesUsed: prev.languagesUsed,
        emergencyCount: prev.emergencyCount + (orchestratorResult.actionPlan?.isEmergency ? 1 : 0),
      }));

    } catch (err) {
      console.error('Orchestrator error:', err);
      const errMsg = {
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, userProfile, resetAgentStatuses]);

  const updateProfile = useCallback((updates) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      try { localStorage.setItem('lifeline_profile', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearMedicalHistory = useCallback(() => {
    setMedicalHistory([]);
    try { localStorage.removeItem('lifeline_medical_history'); } catch {}
  }, []);

  const login = useCallback((authData) => {
    try {
      localStorage.setItem('lifeline_auth', JSON.stringify({ isLoggedIn: true, ...authData }));
    } catch {}
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try { localStorage.removeItem('lifeline_auth'); } catch {}
  }, []);

  const setLanguage = useCallback((lang) => {
    setCurrentLanguage(lang);
    setUserProfile(prev => {
      const updated = { ...prev, language: lang };
      try { localStorage.setItem('lifeline_profile', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setAnalyticsData(prev => {
      const langs = new Set(prev.languagesUsed);
      langs.add(lang);
      return { ...prev, languagesUsed: langs };
    });
  }, []);

  const t = useCallback((key) => {
    try {
      const lang = currentLanguage || 'en';
      return translationsData[lang]?.[key] || translationsData['en']?.[key] || key;
    } catch {
      return key;
    }
  }, [currentLanguage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
    resetAgentStatuses();
  }, [resetAgentStatuses]);

  const value = {
    messages,
    agentStatuses,
    userProfile,
    currentLanguage,
    isProcessing,
    conversationHistory,
    analyticsData,
    agents: AGENTS,
    medicalHistory,
    isAuthenticated,
    sendMessage,
    updateProfile,
    setLanguage,
    t,
    clearChat,
    resetAgentStatuses,
    clearMedicalHistory,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { AGENTS };
export default AppContext;
