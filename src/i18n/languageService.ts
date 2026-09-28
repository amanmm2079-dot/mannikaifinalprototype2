import { LanguageCode } from '../types';
import { STORAGE_KEY_LANGUAGE, RTL_LANGUAGES, DEFAULT_LANGUAGE } from './config';
import { isSupported } from './languageDetector';
import { db } from '../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Persists the preferred language locally and in Firestore for authenticated users.
 */
export async function saveLanguagePreference(lang: LanguageCode, uid?: string): Promise<void> {
  if (!isSupported(lang)) return;

  // 1. Update HTML document lang and dir attributes immediately
  updateDocumentLanguage(lang);

  // 2. Persist in local storage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    }
  } catch (err) {
    console.warn('[i18n] Failed to save language to localStorage:', err);
  }

  // 3. Persist in Firestore users/{uid} if authenticated
  if (uid && db) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        preferredLanguage: lang,
        languageUpdatedAt: serverTimestamp(),
      });
    } catch (err) {
      // Non-fatal if firestore offline or permissions restricted
      console.warn('[i18n] Failed to persist preferredLanguage to Firestore:', err);
    }
  }
}

/**
 * Sets document.documentElement attributes for accessibility and layout direction (RTL/LTR)
 */
export function updateDocumentLanguage(lang: LanguageCode): void {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = lang;
  const isRtl = RTL_LANGUAGES.includes(lang);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
}

/**
 * Returns saved language with fallback
 */
export function getSavedLanguage(): LanguageCode {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE) as LanguageCode | null;
      if (stored && isSupported(stored)) {
        return stored;
      }
    }
  } catch {
    // Ignore
  }
  return DEFAULT_LANGUAGE;
}
