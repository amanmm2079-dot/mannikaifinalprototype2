import { LanguageCode } from '../types';

export interface LanguageDefinition {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptSample: string;
  speechLocale: string;
  locale: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    scriptSample: 'Hello',
    speechLocale: 'en-IN',
    locale: 'en-IN',
    direction: 'ltr',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptSample: 'नमस्ते',
    speechLocale: 'hi-IN',
    locale: 'hi-IN',
    direction: 'ltr',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    scriptSample: 'नमस्कार',
    speechLocale: 'mr-IN',
    locale: 'mr-IN',
    direction: 'ltr',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    scriptSample: 'নমস্কার',
    speechLocale: 'bn-IN',
    locale: 'bn-IN',
    direction: 'ltr',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    scriptSample: 'வணக்கம்',
    speechLocale: 'ta-IN',
    locale: 'ta-IN',
    direction: 'ltr',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    scriptSample: 'నమస్కారం',
    speechLocale: 'te-IN',
    locale: 'te-IN',
    direction: 'ltr',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    scriptSample: 'નમસ્તે',
    speechLocale: 'gu-IN',
    locale: 'gu-IN',
    direction: 'ltr',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    scriptSample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ',
    speechLocale: 'pa-IN',
    locale: 'pa-IN',
    direction: 'ltr',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    scriptSample: 'ನಮಸ್ಕಾರ',
    speechLocale: 'kn-IN',
    locale: 'kn-IN',
    direction: 'ltr',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    scriptSample: 'നമസ്കാരം',
    speechLocale: 'ml-IN',
    locale: 'ml-IN',
    direction: 'ltr',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    scriptSample: 'ନମସ୍କାର',
    speechLocale: 'or-IN',
    locale: 'or-IN',
    direction: 'ltr',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    scriptSample: 'নমস্কাৰ',
    speechLocale: 'as-IN',
    locale: 'as-IN',
    direction: 'ltr',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    scriptSample: 'سلام',
    speechLocale: 'ur-IN',
    locale: 'ur-IN',
    direction: 'rtl',
  },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SPEECH_LOCALE_MAP: Record<LanguageCode, string> = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
  acc[lang.code] = lang.speechLocale;
  return acc;
}, {} as Record<LanguageCode, string>);

export const RTL_LANGUAGES: LanguageCode[] = ['ur'];

export const STORAGE_KEY_LANGUAGE = 'mannik_preferred_language';
