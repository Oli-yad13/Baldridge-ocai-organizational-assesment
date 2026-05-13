// Localization types
export type Locale = 'en' | 'am';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const locales: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr' },
];

export const defaultLocale: Locale = 'en';
