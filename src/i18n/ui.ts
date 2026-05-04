/**
 * UI překlady — Pán Prstenů, 5 jazyků
 * Datum: 2026-05-03
 *
 * Strategie:
 *   - cs primární jazyk (zdroj pravdy), plně přeložené
 *   - en, de, sk, uk plně přeložené (paritní pokrytí UI klíčů)
 *   - chybějící klíče v jakémkoli jazyce → fallback na cs
 *   - obsah uložen v `src/i18n/ui/{lang}.json` (1 soubor / jazyk)
 *
 * Použití (beze změny):
 *   import { getTranslation } from '@i18n/ui';
 *   const t = getTranslation(lang);
 *   <h1>{t('nav.home')}</h1>
 */

import csDict from './ui/cs.json';
import enDict from './ui/en.json';
import deDict from './ui/de.json';
import skDict from './ui/sk.json';
import ukDict from './ui/uk.json';

export const languages = {
  cs: 'Čeština',
  en: 'English',
  de: 'Deutsch',
  sk: 'Slovenčina',
  uk: 'Українська',
} as const;

export const defaultLang = 'cs' as const;
export type Lang = keyof typeof languages;

const cs = csDict as Record<string, string>;
const en = enDict as Record<string, string>;
const de = deDict as Record<string, string>;
const sk = skDict as Record<string, string>;
const uk = ukDict as Record<string, string>;

export const ui = { cs, en, de, sk, uk } as const;

export type TranslationKey = keyof typeof csDict;

export function getTranslation(lang: Lang) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = ui[lang] as Record<string, string>;
    const csOnly = ui.cs as Record<string, string>;
    let str = langDict[key] ?? csOnly[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return str;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  if (segment in ui) return segment as Lang;
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const cleanPath = path.replace(/^\/(cs|en|de|sk|uk)/, '');
  return `/${lang}${cleanPath || '/'}`;
}

export function getPathWithoutLang(path: string): string {
  return path.replace(/^\/(cs|en|de|sk|uk)/, '') || '/';
}
