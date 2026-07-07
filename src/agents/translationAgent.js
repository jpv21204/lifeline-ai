import translations from '../data/translations.json';

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
    this.translations = translations;
  }

  async process({ text, targetLanguage = 'en' }) {
    await delay(300 + Math.random() * 300);

    const lang = targetLanguage.toLowerCase();
    const langData = this.translations[lang] || this.translations['en'];

    // For demo: translate key phrases if available
    let translatedText = text;
    if (lang !== 'en' && langData) {
      // Try to match and translate known phrases
      const enData = this.translations['en'];
      for (const [key, enValue] of Object.entries(enData)) {
        if (text.includes(enValue) && langData[key]) {
          translatedText = translatedText.replace(enValue, langData[key]);
        }
      }
    }

    return {
      translatedText,
      language: lang,
      languageName: LANGUAGE_NAMES[lang] || lang,
      note: lang === 'en'
        ? 'Content is displayed in English.'
        : `Content translated to ${LANGUAGE_NAMES[lang] || lang}. For critical medical information, please also consult in English or with a healthcare provider.`,
      availableLanguages: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name }))
    };
  }
}
