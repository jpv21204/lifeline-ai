const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const LANGUAGE_NAMES = {
  en: 'English', hi: 'हिन्दी (Hindi)', te: 'తెలుగు (Telugu)', ta: 'தமிழ் (Tamil)',
  kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', bn: 'বাংলা (Bengali)',
  mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)', pa: 'ਪੰਜਾਬੀ (Punjabi)',
  or: 'ଓଡ଼ିଆ (Odia)', ur: 'اردو (Urdu)'
};

export class TranslationAgent {
  constructor() {
    this.name = 'Translation Agent';
    this.icon = '🌐';
  }

  async process({ text, targetLanguage = 'en' }) {
    await delay(300 + Math.random() * 300);

    const lang = targetLanguage.toLowerCase();
    let translatedText = text;

    if (lang !== 'en') {
      try {
        // Purely Agentic: Use Google Translate public REST API client endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (Array.isArray(data) && data[0]) {
          // Extract and join all translated segment texts
          translatedText = data[0].map(segment => segment[0]).join('');
        }
      } catch (err) {
        console.warn("Live translation API failed, fallback to raw text:", err);
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
