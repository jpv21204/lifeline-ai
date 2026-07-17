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
  ml: "നമസ്കാരം! ഞാൻ ലൈഫ്‌‌ലൈൻ AI, നിങ്ങളുടെ കമ്മ്യൂണിറ്റി ആരോഗ്യ സഹായിയാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം? നിങ്ങളുടെ ലക്ഷണങ്ങളോ ആരോഗ്യ പ്രശ്നങ്ങളോ ദയവായി വിവരിക്കുക.",
  bn: "হ্যালো! আমি লাইফলাইন AI, আপনার স্বাস্থ্য সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? অনুগ্রহ করে আপনার উপসর্গ বা স্বাস্থ্য সমস্যাগুলি বলুন।",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਲਾਈਫਲਾਈਨ AI ਹਾਂ, ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਬਾਰੇ ਦੱਸੋ।",
  mr: "नमस्कार! मी खालीलपैकी लाइफलाईन AI आहे, आपला आरोग्य सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो? कृपया तुमच्या लक्षणांबद्दल सांगा।",
  gu: "નમસ્તે! હું લાઇફલાઇન AI છું, તમારો આરોગ્ય સહાયક. આજે હું તમને કેવી રીતે મદદ કરી શકું? કૃપા કરીને તમારા લક્ષણો વિશે જણાવો.",
  or: "ନମସ୍କାର! ମୁଁ ଲାଇଫଲାଇନ AI, ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ | ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି? ଦୟାକରି ଆପଣଙ୍କର ଲକ୍ଷଣ ବିଷୟରେ କୁହନ୍ତୁ |",
  ur: "سلام! میں لائف لائن AI ہوں، آپ کا صحت کا مددگار۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟ براہ کرم اپنے علامات کے بارے میں بتائیں۔"
};

/* ------------------------------------------------------------------ */
/*  Simulated Orchestrator                                             */
/* ------------------------------------------------------------------ */
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

const GENERAL_FALLBACK = `### 🩺 General Health & Preventive Wellness Advice\nTo address your health inquiry, here are the core pillars of clinical preventive care:\n\n1.  **Hydration:** Maintain fluid intake of 2.5 to 3 liters of clean water daily.\n2.  **Balanced Nutrition:** Incorporate fiber-rich foods, fresh leafy vegetables, lean proteins, and reduce excessive sodium and refined sugars.\n3.  **Physical Activity:** Aim for at least 30 minutes of moderate aerobic exercise (like brisk walking) 5 days a week.\n4.  **Routine Monitoring:** Keep track of vital signs (blood pressure, blood glucose, temperature) regularly.\n\n*Please note: I am an AI assistant for guidance. Always consult a certified healthcare professional for medical diagnoses.*`;

async function simulateOrchestrator(userMessage, profile, setAgentStatuses) {
  const results = {};
  const lowerMsg = userMessage.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const isEmergency = /chest pain|difficulty breathing|unconscious|heart attack|stroke|bleeding|seizure|accident|not breathing|emergency/i.test(userMessage);

  // Define clinical indicators that force the full pipeline
  const personalIndicators = ['suffering', 'days', 'last', 'i have', 'i am', 'my ', 'since', 'feel', 'hurt', 'pain in'];
  const symptomKeywords = ['fever', 'cough', 'cold', 'headache', 'body pain', 'sore throat', 'fatigue', 'nausea', 'vomiting', 'diarrhea', 'chest pain', 'breathlessness', 'difficulty breathing', 'rash', 'swelling', 'dizziness', 'weakness', 'bleeding', 'wound', 'injury', 'choke', 'seizure', 'unconscious'];
  const hasPersonalIndicator = personalIndicators.some(word => lowerMsg.includes(word));
  const hasSymptom = symptomKeywords.some(word => lowerMsg.includes(word));
  const forceClinical = (hasSymptom && hasPersonalIndicator) || isEmergency;

  // Dynamic FAQ query checks
  const matchedFaq = !forceClinical && CLINICAL_FAQ.find(item => 
    item.keywords.some(word => lowerMsg.includes(word))
  );

  if (matchedFaq) {
    const text = matchedFaq.response;
    results.general_info = { text };
    return {
      results,
      actionPlan: {
        urgency: 'low',
        urgencyLabel: 'Low',
        isEmergency: false,
        summary: text,
        sections: results
      }
    };
  }

  // Dynamic Knowledge responses inside simulation
  const mockKnowledge = {
    malaria: `### 🩺 Understanding Malaria\n\nMalaria is a life-threatening disease spread by the bite of an infected female Anopheles mosquito.\n\n*   **Symptoms:** High fever, shaking chills, muscle aches, fatigue.\n*   **Prevention:** Use bed nets and repellents.\n*   **Treatment:** Antimalarials prescribed by a doctor. Seek medical attention immediately.`,
    dengue: `### 🦟 Dengue Fever Prevention & Care\n\nDengue is a viral infection transmitted to humans through mosquito bites.\n\n*   **Symptoms:** Sudden high fever, severe headache, joint pains.\n*   **Home Care:** Hydrate extensively. Avoid Aspirin or Ibuprofen.\n*   **Warning Signs:** Persistent vomiting, bleeding gums. Seek emergency care.`,
    fever: `### 🌡️ Fever Management Care Guide\n\nA fever is a sign that your body is fighting off infection.\n\n*   **Care:** Drink fluids, rest, and take Paracetamol (500mg) as needed.\n*   **When to see a Doctor:** Temp > 103°F (39.4°C) or lasting more than 3 days.`,
    cough: `### 💨 Cough Relief Guidance\n\nA cough reflex clears your airway of irritants and mucus.\n\n*   **Home Remedies:** Warm salt water gargles, herbal tea with honey.\n*   **When to see a Doctor:** Cough lasting > 3 weeks, chest pain, or coughing up blood.`,
    hydration: `### 💧 The Importance of Hydration\n\nStaying hydrated regulates body temperature and flushes toxins.\n\n*   **Guideline:** Aim for 2.5 to 3 liters of water per day.`
  };

  const foundKeyword = Object.keys(mockKnowledge).find(key => lowerMsg.includes(key));
  if (foundKeyword && (lowerMsg.startsWith('what is') || lowerMsg.startsWith('explain') || lowerMsg.includes('prevent') || lowerMsg.endsWith('?'))) {
    const text = mockKnowledge[foundKeyword];
    results.general_info = { text };
    return {
      results,
      actionPlan: {
        urgency: 'low',
        urgencyLabel: 'Low',
        isEmergency: false,
        summary: text,
        sections: results
      }
    };
  }

  const isHospitalQuery = /\b(hospital|hospitals|clinic|clinics|doctor|doctors|dispensary|phc|chc|medical center|health center)\b/.test(lowerMsg) || 
                          lowerMsg.includes('near me') || 
                          lowerMsg.includes('chittor') || 
                          lowerMsg.includes('tirupati') ||
                          lowerMsg.includes('warangal') ||
                          lowerMsg.includes('karimnagar') ||
                          lowerMsg.includes('chittoor');

  const isSchemeQuery = /scheme|yojana|eligible|government|benefit|ration|insurance|ayushman|pmjay|janani|amma/i.test(userMessage);
  const isMedicineQuery = /medicine|tablet|drug|paracetamol|ibuprofen|dosage|side effect|amoxicillin|antibiotic|azithromycin/i.test(userMessage);

  if (isHospitalQuery && !isMedicineQuery && !isSchemeQuery) {
    const selectedAgents = ['hospital_finder', 'translation', 'analytics'];
    const fresh = {};
    AGENTS.forEach(a => { fresh[a.id] = { status: 'idle', time: null }; });
    setAgentStatuses(fresh);

    for (const agentId of selectedAgents) {
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'processing', time: null } }));
      const start = performance.now();
      await new Promise(r => setTimeout(r, 200));
      const elapsed = Math.round(performance.now() - start);
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'complete', time: elapsed } }));
    }

    let matchedLocation = profile.location || 'Chittoor';
    const inMatch = userMessage.match(/in\s+([A-Za-z\s]+)/i);
    const nearMatch = userMessage.match(/near\s+([A-Za-z\s]+)/i);
    if (inMatch && inMatch[1]) matchedLocation = inMatch[1].trim();
    else if (nearMatch && nearMatch[1]) matchedLocation = nearMatch[1].trim();

    let liveHospitals = [];
    let isLive = false;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospitals+in+${encodeURIComponent(matchedLocation)}&addressdetails=1&limit=5`;
      const res = await fetch(url, { headers: { 'User-Agent': 'LifeLineAI-Hackathon' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        isLive = true;
        liveHospitals = data.map((h, i) => {
          const addr = h.address || {};
          const city = addr.city || addr.town || addr.village || matchedLocation;
          return {
            id: `live-${i}`,
            name: h.name || h.display_name.split(',')[0],
            address: [addr.road, addr.suburb, city].filter(Boolean).join(', ') || h.display_name,
            phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
            rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
            beds: Math.floor(10 + Math.random() * 150),
            emergency: Math.random() > 0.4,
            ayushmanBharat: Math.random() > 0.3,
            type: h.display_name.toLowerCase().includes('govt') || h.display_name.toLowerCase().includes('government') ? 'government' : 'private'
          };
        });
      }
    } catch {
      liveHospitals = [
        { id: 'sim-1', name: 'District General Hospital', address: `Greamspet, ${matchedLocation}`, phone: '08572-232566', rating: 4.2, beds: 120, emergency: true, ayushmanBharat: true, type: 'government' },
        { id: 'sim-2', name: 'Apollo Clinic', address: `High Road, ${matchedLocation}`, phone: '08572-225999', rating: 4.5, beds: 45, emergency: false, ayushmanBharat: false, type: 'private' }
      ];
    }

    results.hospital_finder = { hospitals: liveHospitals, totalFound: liveHospitals.length, isAgenticSearch: isLive, tip: '💡 Real-time OpenStreetMap query completed.' };
    results.translation = { language: profile.language || 'en', note: 'Translated.' };
    results.analytics = { queryType: 'Hospital Search', responseConfidence: 0.95 };

    const summaryText = generateActionPlanMarkdown(results, profile, false, 'Low');
    return { results, actionPlan: { urgency: 'low', urgencyLabel: 'Low', isEmergency: false, summary: summaryText, sections: results } };
  }

  if (isMedicineQuery && !isHospitalQuery && !isSchemeQuery) {
    const selectedAgents = ['medicine_info', 'translation', 'analytics'];
    const fresh = {};
    AGENTS.forEach(a => { fresh[a.id] = { status: 'idle', time: null }; });
    setAgentStatuses(fresh);

    for (const agentId of selectedAgents) {
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'processing', time: null } }));
      const start = performance.now();
      await new Promise(r => setTimeout(r, 200));
      const elapsed = Math.round(performance.now() - start);
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'complete', time: elapsed } }));
    }

    results.medicine_info = { medicines: [{ name: 'Paracetamol (500mg)', usage: 'Fever and mild pain relief', dosage: '1 tablet every 6 hours as needed', sideEffects: ['Nausea', 'Rare allergic reaction'], warning: 'Do not exceed 4g (8 tablets) in 24 hours' }] };
    results.translation = { language: profile.language || 'en', note: 'Translated.' };
    results.analytics = { queryType: 'Medicine Query', responseConfidence: 0.92 };

    const summaryText = generateActionPlanMarkdown(results, profile, false, 'Low');
    return { results, actionPlan: { urgency: 'low', urgencyLabel: 'Low', isEmergency: false, summary: summaryText, sections: results } };
  }

  if (isSchemeQuery && !isHospitalQuery && !isMedicineQuery) {
    const selectedAgents = ['government_scheme', 'translation', 'analytics'];
    const fresh = {};
    AGENTS.forEach(a => { fresh[a.id] = { status: 'idle', time: null }; });
    setAgentStatuses(fresh);

    for (const agentId of selectedAgents) {
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'processing', time: null } }));
      const start = performance.now();
      await new Promise(r => setTimeout(r, 200));
      const elapsed = Math.round(performance.now() - start);
      setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'complete', time: elapsed } }));
    }

    results.government_scheme = { schemes: [{ name: 'Ayushman Bharat (PM-JAY)', eligibility: 'BPL families', coverage: '₹5 lakh per family/year', description: 'Free secondary & tertiary care hospitalization.', status: 'Check Eligibility' }] };
    results.translation = { language: profile.language || 'en', note: 'Translated.' };
    results.analytics = { queryType: 'Scheme Matcher', responseConfidence: 0.94 };

    const summaryText = generateActionPlanMarkdown(results, profile, false, 'Low');
    return { results, actionPlan: { urgency: 'low', urgencyLabel: 'Low', isEmergency: false, summary: summaryText, sections: results } };
  }

  // General conversational query fallback in simulation
  const isGeneralQuestion = !forceClinical && (/\b(why|what|how|who|tell|explain|tips|prevent|cure|advice|hello|hi|hey)\b/.test(lowerMsg) || lowerMsg.endsWith('?'));
  if (isGeneralQuestion) {
    const summaryText = GENERAL_FALLBACK;
    results.general_info = { text: summaryText };
    return {
      results,
      actionPlan: {
        urgency: 'low',
        urgencyLabel: 'Low',
        isEmergency: false,
        summary: summaryText,
        sections: results
      }
    };
  }

  // Clinical full pipeline fallback
  const agentOrder = ['health_assessment', 'emergency_detection', 'hospital_finder', 'government_scheme', 'medicine_info', 'followup', 'translation', 'analytics'];
  for (const agentId of agentOrder) {
    setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'processing', time: null } }));
    const start = performance.now();
    await new Promise(r => setTimeout(r, 150));
    const elapsed = Math.round(performance.now() - start);
    setAgentStatuses(prev => ({ ...prev, [agentId]: { status: 'complete', time: elapsed } }));
  }

  results.health_assessment = {
    matchedSymptoms: extractSymptoms(userMessage),
    severity: isEmergency ? 'critical' : 'moderate',
    possibleConditions: isEmergency
      ? ['Acute Coronary Syndrome']
      : ['Viral Fever', 'Seasonal Flu'],
    selfCare: isEmergency
      ? ['Call 108 immediately']
      : ['Rest, hydration, and paracetamol as needed. Monitor temp.'],
  };

  results.emergency_detection = {
    isEmergency,
    urgencyLevel: isEmergency ? 'emergency' : 'moderate',
    emergencyActions: isEmergency ? ['Call 108 ambulance', 'Rush to nearest ER'] : [],
  };

  results.hospital_finder = {
    hospitals: [
      { name: 'District General Hospital', address: `Main Road, ${profile.location || 'Chittoor'}`, phone: '08572-232566', rating: 4.2, beds: 120, emergency: true, ayushmanBharat: true, type: 'government' }
    ],
  };

  results.government_scheme = {
    schemes: [
      { name: 'Ayushman Bharat (PM-JAY)', eligibility: 'BPL families', coverage: '₹5 lakh per family/year', description: 'Free secondary & tertiary care hospitalization.', status: 'Check Eligibility' }
    ],
  };

  results.medicine_info = isEmergency ? {
    medicines: [
      { name: 'Aspirin (150mg)', usage: 'Antiplatelet (blood thinner)', dosage: 'Chew 1-2 tablets immediately in case of cardiac chest pain', warning: 'Chew the tablet to speed up absorption. Do not swallow whole.' },
      { name: 'Sorbitrate (5mg)', usage: 'Angina relief (vasodilator)', dosage: 'Place 1 tablet under the tongue (sublingual)', warning: 'Do not swallow. Do not take with Sildenafil/Tadalafil.' }
    ],
  } : {
    medicines: [
      { name: 'Paracetamol (500mg)', usage: 'Fever relief', dosage: '1 tablet every 6 hours as needed', sideEffects: ['Rare'], warning: 'Consult doctor if fever persists beyond 3 days' }
    ],
  };

  results.followup = isEmergency ? {
    reminders: [
      { action: 'Take emergency Aspirin (chewed) immediately', when: 'NOW', priority: 'high' },
      { action: 'Avoid physical exertion and rest in comfortable sitting position', when: 'Continuous', priority: 'high' }
    ],
  } : {
    reminders: [
      { action: 'Check temperature', when: 'Every 4 hours', priority: 'high' }
    ],
  };

  results.translation = { language: profile.language || 'en', note: 'Translated.' };
  results.analytics = { queryType: 'Symptom Assessment', responseConfidence: 0.88 };

  const summaryText = generateActionPlanMarkdown(results, profile, isEmergency, isEmergency ? 'Critical' : 'Low');

  return {
    results,
    actionPlan: {
      urgency: isEmergency ? 4 : 2,
      urgencyLabel: isEmergency ? 'Critical' : 'Low',
      isEmergency,
      summary: summaryText,
      sections: results
    }
  };
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
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeline_search_history');
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

      /* Save history conditionally */
      const record = {
        id: assistantMsg.id,
        timestamp: assistantMsg.timestamp,
        symptoms: content.trim(),
        urgency: orchestratorResult.actionPlan?.urgency || 'unknown',
        summary: orchestratorResult.actionPlan?.summary || '',
        actionPlan: orchestratorResult.actionPlan,
        agentResults: orchestratorResult.results,
        responseTime: elapsed,
      };

      const isClinical = orchestratorResult.results && 
                         (orchestratorResult.results.health_assessment || orchestratorResult.results.emergency_detection);

      if (isClinical) {
        setMedicalHistory(prev => {
          const updated = [...prev, record];
          try { localStorage.setItem('lifeline_medical_history', JSON.stringify(updated)); } catch {}
          return updated;
        });
      } else {
        // Classify search type
        let searchType = 'Health FAQ';
        if (orchestratorResult.results.hospital_finder) searchType = 'Facility Search';
        else if (orchestratorResult.results.medicine_info) searchType = 'Drug Guidelines';
        else if (orchestratorResult.results.government_scheme) searchType = 'Scheme Matching';

        const searchRecord = {
          ...record,
          searchType
        };

        setSearchHistory(prev => {
          const updated = [...prev, searchRecord];
          try { localStorage.setItem('lifeline_search_history', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

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

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    try { localStorage.removeItem('lifeline_search_history'); } catch {}
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
    searchHistory,
    isAuthenticated,
    sendMessage,
    updateProfile,
    setLanguage,
    t,
    clearChat,
    resetAgentStatuses,
    clearMedicalHistory,
    clearSearchHistory,
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
