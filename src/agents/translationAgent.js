import translations from '../data/translations.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const LANGUAGE_NAMES = {
  en: 'English', hi: 'हिन्दी (Hindi)', te: 'తెలుగు (Telugu)', ta: 'தமிழ் (Tamil)',
  kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)', pa: 'ਪੰਜਾਬี (Punjabi)',
  or: 'ଓଡ଼ିଆ (Odia)', ur: 'اردو (Urdu)'
};

const MEDICAL_TRANSLATION_DICTIONARY = {
  te: {
    // Headers
    '### 🚨 **EMERGENCY WARNING**': '### 🚨 **అత్యవసర హెచ్చరిక**',
    '### 🩺 Symptom & Health Assessment': '### 🩺 లక్షణాలు & ఆరోగ్య అంచనా',
    '### 🏥 Recommended Local Facilities': '### 🏥 సిఫార్సు చేయబడిన స్థానిక ఆసుపత్రులు',
    '### 💊 Medicine Guidelines & Alternatives': '### 💊 ఔషధ మార్గదర్శకాలు & ప్రత్యామ్నాయాలు',
    '### 📋 Government Health Schemes': '### 📋 ప్రభుత్వ ఆరోగ్య పథకాలు',
    '### 📅 Monitoring & Follow-up': '### 📅 పర్యవేక్షణ & ఫాలో-అప్',
    '### 🩹 First Aid for Cuts & Bleeding': '### 🩹 గాయాలు & రక్తస్రావం కోసం ప్రథమ చికిత్స',
    '### 🚨 Critical First Aid Instructions': '### 🚨 క్లిష్టమైన ప్రథమ చికిత్స సూచనలు',
    '### 🩺 High Blood Pressure (Hypertension) Guidelines': '### 🩺 అధిక రక్తపోటు (హైపర్టెన్షన్) మార్గదర్శకాలు',
    '### 🩸 Diabetes & Blood Sugar Management': '### 🩸 మధుమేహం & రక్తంలో చక్కెర నియంత్రణ',
    '### 🤢 Stomach Pain & Gastritis Relief': '### 🤢 కడుపు నొప్పి & గ్యాస్ట్రిటిస్ ఉపశమనం',
    '### 💆 Headache & Migraine Management': '### 💆 తలనొప్పి & మైగ్రేన్ నిర్వహణ',
    '### ☀️ Heat Stroke & Sunburn First Aid': '### ☀️ వడదెబ్బ ప్రథమ చికిత్స',
    '### 🩺 General Health & Preventive Wellness Advice': '### 🩺 సాధారణ ఆరోగ్యం & నివారణ సలహా',

    // Labels
    '**Immediate Actions:**': '**తక్షణ చర్యలు:**',
    '*   **Urgency Level:**': '*   **అత్యవసర స్థాయి:**',
    '*   **Possible Conditions:**': '*   **సాధ్యమయ్యే ఆరోగ్య సమస్యలు:**',
    '*   **Care Instructions:**': '*   **ఆరోగ్య సంరక్షణ సూచనలు:**',
    '*   **Precautions (Seek immediate care if):**': '*   **ముందు జాగ్రత్తలు (ఈ క్రింది లక్షణాలు ఉంటే వెంటనే ఆసుపత్రికి వెళ్ళండి):**',
    'Address:': 'చిరునామా:',
    'Phone:': 'ఫోన్ నంబర్:',
    'Rating:': 'రేటింగ్:',
    'Beds:': 'పడకలు:',
    'Benefit:': 'ప్రయోజనం:',
    'Eligibility:': 'అర్హత:',
    'Usage:': 'ఉపయోగం:',
    'Dosage:': 'మోతాదు:',
    'Warning:': 'హెచ్చరిక:',

    // Urgency Levels
    'Low Urgency': 'తక్కువ అత్యవసరం',
    'Medium Urgency': 'మధ్యస్థ అత్యవసరం',
    'High Urgency': 'అధిక అత్యవసరం',
    'Very High Urgency': 'చాలా ఎక్కువ అత్యవసరం',
    'Critical Urgency': 'తీవ్రమైన అత్యవసరం',

    // Sentences & content
    'Call 108 ambulance': '108 అంబులెన్స్‌కు కాల్ చేయండి',
    'Rush to nearest ER': 'సమీప అత్యవసర విభాగానికి (ER) వెళ్ళండి',
    'Call 108 immediately': 'వెంటనే 108 కి కాల్ చేయండి',
    'Rest, hydration, and paracetamol as needed. Monitor temp.': 'విశ్రాంతి, తగినంత నీరు త్రాగడం, మరియు అవసరమైతే పారాసెటమాల్ వేసుకోవడం. జ్వరాన్ని గమనించండి.',
    'District General Hospital': 'జిల్లేరు జిల్లా ప్రభుత్వ ఆసుపత్రి',
    'Paracetamol (500mg)': 'పారాసెటమాల్ (500mg)',
    'Fever relief': 'జ్వరం ఉపశమనం',
    '1 tablet every 6 hours as needed': 'అవసరమైతే ప్రతి 6 గంటలకు 1 టాబ్లెట్',
    'Consult doctor if fever persists beyond 3 days': 'జ్వరం 3 రోజులకు మించి ఉంటే వైద్యుడిని సంప్రదించండి',
    'Ayushman Bharat (PM-JAY)': 'ఆయుష్మాన్ భారత్ (PM-JAY)',
    'Coverage of ₹5 lakh per family/year': 'कुటుంబానికి సంవత్సరానికి ₹5 లక్షల భీమా',
    'BPL families': 'దారిద్య్ర రేఖకు దిగువన ఉన్న (BPL) కుటుంబాలు',
    'Check temperature (Every 4 hours)': 'శరీర ఉష్ణోగ్రతను తనిఖీ చేయండి (ప్రతి 4 గంటలకు)',
    
    // Additional Telugu terms matching standard text
    'Viral Fever': 'వైరల్ జ్వరం',
    'Seasonal Flu': 'శీతోష్ణస్థితి ఫ్లూ',
    'Acute Coronary Syndrome': 'తీవ్రమైన గుండె నొప్పి (ACS)',
    'Aspirin (150mg)': 'ఆస్పిరిన్ (150mg)',
    'Sorbitrate (5mg)': 'సార్బిట్రేట్ (5mg)',
    'Chew 1-2 tablets immediately': 'వెంటనే 1-2 మాత్రలు నమలండి',
    'Place 1 tablet under the tongue': '1 మాత్రను నాలుక కింద ఉంచండి',
    'Avoid physical exertion and rest': 'శారీరక శ్రమను నివారించండి మరియు విశ్రాంతి తీసుకోండి',
    'Take emergency Aspirin': 'అత్యవసర ఆస్పిరిన్ తీసుకోండి',
    'Check temperature': 'శరీర ఉష్ణోగ్రతను తనిఖీ చేయండి'
  },
  hi: {
    // Headers
    '### 🚨 **EMERGENCY WARNING**': '### 🚨 **आपातकालीन चेतावनी**',
    '### 🩺 Symptom & Health Assessment': '### 🩺 लक्षण और स्वास्थ्य मूल्यांकन',
    '### 🏥 Recommended Local Facilities': '### 🏥 अनुशंसित स्थानीय अस्पताल',
    '### 💊 Medicine Guidelines & Alternatives': '### 💊 दवा दिशानिर्देश और विकल्प',
    '### 📋 Government Health Schemes': '### 📋 सरकारी स्वास्थ्य योजनाएं',
    '### 📅 Monitoring & Follow-up': '### 📅 निगरानी और फॉलो-अप',
    '### 🩹 First Aid for Cuts & Bleeding': '### 🩹 चोट और रक्तस्राव के लिए प्राथमिक चिकित्सा',
    '### 🚨 Critical First Aid Instructions': '### 🚨 महत्वपूर्ण प्राथमिक चिकित्सा निर्देश',
    '### 🩺 High Blood Pressure (Hypertension) Guidelines': '### 🩺 उच्च रक्तचाप (हाइपरटेंशन) दिशानिर्देश',
    '### 🩸 Diabetes & Blood Sugar Management': '### 🩸 मधुमेह और रक्त शर्करा प्रबंधन',
    '### 🤢 Stomach Pain & Gastritis Relief': '### 🤢 पेट दर्द और गैस्ट्राइटिस से राहत',
    '### 💆 Headache & Migraine Management': '### 💆 सिरदर्द और माइग्रेन प्रबंधन',
    '### ☀️ Heat Stroke & Sunburn First Aid': '### ☀️ लू (हीट स्ट्रोक) प्राथमिक चिकित्सा',
    '### 🩺 General Health & Preventive Wellness Advice': '### 🩺 सामान्य स्वास्थ्य और निवारक कल्याण सलाह',

    // Labels
    '**Immediate Actions:**': '**तत्काल कार्रवाई:**',
    '*   **Urgency Level:**': '*   **आपातकालीन स्तर:**',
    '*   **Possible Conditions:**': '*   **संभावित बीमारियां:**',
    '*   **Care Instructions:**': '**देखभाल के निर्देश:**',
    '*   **Precautions (Seek immediate care if):**': '*   **सावधानियां (यदि निम्नलिखित लक्षण हों तो तुरंत अस्पताल जाएं):**',
    'Address:': 'पता:',
    'Phone:': 'फ़ोन:',
    'Rating:': 'रेटिंग:',
    'Beds:': 'बिस्तर:',
    'Benefit:': 'लाभ:',
    'Eligibility:': 'पात्रता:',
    'Usage:': 'उपयोग:',
    'Dosage:': 'खुराक:',
    'Warning:': 'चेतावनी:',

    // Urgency Levels
    'Low Urgency': 'कम तात्कालिकता',
    'Medium Urgency': 'मध्यम तात्कालिकता',
    'High Urgency': 'उच्च तात्कालिकता',
    'Very High Urgency': 'बहुत उच्च तात्कालिकता',
    'Critical Urgency': 'गंभीर तात्कालिकता',

    // Sentences & content
    'Call 108 ambulance': '108 एम्बुलेंस को कॉल करें',
    'Rush to nearest ER': 'निकटतम आपातकालीन कक्ष (ER) जाएं',
    'Call 108 immediately': 'तुरंत 108 पर कॉल करें',
    'Rest, hydration, and paracetamol as needed. Monitor temp.': 'आराम करें, पर्याप्त पानी पीएं, और आवश्यकतानुसार पैरासिटामोल लें। तापमान की निगरानी करें।',
    'District General Hospital': 'जिला सरकारी अस्पताल',
    'Paracetamol (500mg)': 'पैरासिटामोल (500mg)',
    'Fever relief': 'बुखार से राहत',
    '1 tablet every 6 hours as needed': 'आवश्यकतानुसार हर 6 घंटे में 1 गोली',
    'Consult doctor if fever persists beyond 3 days': 'यदि बुखार 3 दिनों से अधिक रहता है तो डॉक्टर से संपर्क करें',
    'Ayushman Bharat (PM-JAY)': 'आयुष्मान भारत (PM-JAY)',
    'Coverage of ₹5 lakh per family/year': 'प्रति परिवार/वर्ष ₹5 लाख का कवरेज',
    'BPL families': 'बीपीएल (BPL) परिवार',
    'Check temperature (Every 4 hours)': 'तापमान की जांच करें (हर 4 घंटे में)',
    
    // Additional Hindi terms
    'Viral Fever': 'वायरल बुखार',
    'Seasonal Flu': 'मौसमी फ्लू',
    'Acute Coronary Syndrome': 'गंभीर हृदय शूल (ACS)',
    'Aspirin (150mg)': 'एस्पिरिन (150mg)',
    'Sorbitrate (5mg)': 'सॉर्बिट्रेट (5mg)',
    'Chew 1-2 tablets immediately': 'तुरंत 1-2 गोलियां चबाएं',
    'Place 1 tablet under the tongue': '1 गोली जीभ के नीचे रखें',
    'Avoid physical exertion and rest': 'शारीरिक परिश्रम से बचें और आराम करें',
    'Take emergency Aspirin': 'आपातकालीन एस्पिरिन लें',
    'Check temperature': 'तापमान की जांच करें'
  }
};

export class TranslationAgent {
  constructor() {
    this.name = 'Translation Agent';
    this.icon = '🌐';
    this.translations = translations;
  }

  async process({ text, targetLanguage = 'en' }) {
    await delay(200 + Math.random() * 200);

    const lang = targetLanguage.toLowerCase();
    let translatedText = text;

    // Execute dynamic medical dictionary translations first
    if (lang !== 'en' && MEDICAL_TRANSLATION_DICTIONARY[lang]) {
      const dict = MEDICAL_TRANSLATION_DICTIONARY[lang];
      for (const [enKey, langVal] of Object.entries(dict)) {
        const escapedKey = enKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        translatedText = translatedText.replace(regex, langVal);
      }
    }

    // Try standard static word replacements
    const langData = this.translations[lang] || this.translations['en'];
    if (lang !== 'en' && langData) {
      const enData = this.translations['en'];
      for (const [key, enValue] of Object.entries(enData)) {
        if (translatedText.includes(enValue) && langData[key]) {
          const escapedVal = enValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(escapedVal, 'g');
          translatedText = translatedText.replace(regex, langData[key]);
        }
      }
    }

    return {
      translatedText,
      language: lang,
      languageName: LANGUAGE_NAMES[lang] || lang,
      note: lang === 'en'
        ? 'Content is displayed in English.'
        : `Content translated to ${LANGUAGE_NAMES[lang] || lang}.`,
      availableLanguages: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name }))
    };
  }
}
