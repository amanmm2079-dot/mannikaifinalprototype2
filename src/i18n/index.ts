import { LanguageCode } from '../types';
import { TranslationSchema, en } from './translations/en';
import { hi } from './translations/hi';
import { mr } from './translations/mr';
import { bn } from './translations/bn';
import { ta } from './translations/ta';
import { te } from './translations/te';
import { gu } from './translations/gu';
import { pa } from './translations/pa';
import { kn } from './translations/kn';
import { ml } from './translations/ml';
import { or } from './translations/or';
import { as } from './translations/as';
import { ur } from './translations/ur';

export * from './config';
export * from './languageService';
export * from './languageDetector';
export type { TranslationSchema } from './translations/en';

export const TRANSLATIONS: Record<LanguageCode, TranslationSchema> = {
  en,
  hi,
  mr,
  bn,
  ta,
  te,
  gu,
  pa,
  kn,
  ml,
  or,
  as,
  ur,
};

/**
 * Universal translation resolver supporting nested dot-notation paths:
 * Example: t('ml', 'navigation.home') -> 'പ്രധാന പേജ്'
 * Example: t('ml', 'dashboard.welcomeBack') -> 'തിരികെ സ്വാഗതം'
 * Falls back to English if key is missing in target language.
 * Replaces template variables: {name}, {count}, etc.
 */
export function t(
  lang: LanguageCode,
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const activeDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let value: any = resolvePath(activeDict, path);

  // Fallback to English if untranslated
  if (value === undefined || value === null) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation for key: "${path}" in language: "${lang}"`);
    }
    value = resolvePath(TRANSLATIONS.en, path);
  }

  // Fallback to the key path if missing in English too
  if (value === undefined || value === null) {
    return path;
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  // Parameter interpolation: {name} -> 'Sunita'
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : `{${key}}`;
    });
  }

  return value;
}

/**
 * Helper to traverse object with dot-notation
 */
function resolvePath(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Returns a bound translator function for a given language:
 * const t = getTranslator('ml');
 * t('dashboard.welcomeBack') -> 'തിരികെ സ്വാഗതം'
 */
export function getTranslator(lang: LanguageCode) {
  return (path: string, params?: Record<string, string | number | undefined>) => t(lang, path, params);
}

/**
 * Text-to-speech helper with localized voice selection
 */
export function speakText(text: string, lang: LanguageCode = 'en') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN',
    };
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
