import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, STORAGE_KEY_LANGUAGE } from './config';

/**
 * Detects the user's preferred language using a hierarchy:
 * 1. User profile preferredLanguage (if authenticated and passed)
 * 2. Local storage preference
 * 3. Browser navigator language (matching supported languages)
 * 4. Default fallback: 'en'
 */
export function detectLanguage(authenticatedUserLang?: LanguageCode): LanguageCode {
  if (authenticatedUserLang && isSupported(authenticatedUserLang)) {
    return authenticatedUserLang;
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE) as LanguageCode | null;
      if (stored && isSupported(stored)) {
        return stored;
      }
    }
  } catch {
    // LocalStorage might be disabled in private browsing or iframe
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const navCode = navigator.language.split('-')[0].toLowerCase() as LanguageCode;
    if (isSupported(navCode)) {
      return navCode;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function isSupported(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}
