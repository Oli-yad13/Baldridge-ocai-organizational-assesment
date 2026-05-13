'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale } from './types';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: any;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem('locale') as Locale;
    console.log(`LocaleProvider: Loading saved locale from localStorage: ${savedLocale}`);
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'am')) {
      console.log(`LocaleProvider: Setting locale to saved value: ${savedLocale}`);
      setLocaleState(savedLocale);
    } else {
      console.log(`LocaleProvider: No valid saved locale, using default: ${defaultLocale}`);
      // Set default locale in localStorage
      localStorage.setItem('locale', defaultLocale);
    }
  }, []);

  useEffect(() => {
    // Load translations for current locale
    loadTranslations(locale);
  }, [locale]);

  const loadTranslations = async (loc: Locale) => {
    try {
      setIsLoading(true);
      console.log(`Loading translations for locale: ${loc}`);
      const common = await import(`@/locales/${loc}/common.json`);
      const auth = await import(`@/locales/${loc}/auth.json`);
      const ocai = await import(`@/locales/${loc}/ocai.json`);
      const baldrige = await import(`@/locales/${loc}/baldrige.json`);
      const employee = await import(`@/locales/${loc}/employee.json`);
      const facilitator = await import(`@/locales/${loc}/facilitator.json`);
      const admin = await import(`@/locales/${loc}/admin.json`);
      const about = await import(`@/locales/${loc}/about.json`);
      const contact = await import(`@/locales/${loc}/contact.json`);
      const privacy = await import(`@/locales/${loc}/privacy.json`);
      const terms = await import(`@/locales/${loc}/terms.json`);

      const loadedTranslations = {
        ...common.default,
        ...auth.default,
        ...ocai.default,
        ...baldrige.default,
        ...employee.default,
        ...facilitator.default,
        ...admin.default,
        ...about.default,
        ...contact.default,
        ...privacy.default,
        ...terms.default,
      };

      console.log(`Translations loaded for ${loc}:`, Object.keys(loadedTranslations));
      console.log('Sample translation check:', {
        'nav.about': loadedTranslations.nav?.about,
        'home.hero.title1': loadedTranslations.home?.hero?.title1
      });
      console.log('Privacy translations check:', {
        'hasPrivacy': !!loadedTranslations.privacy,
        'privacyTitle': loadedTranslations.privacy?.title
      });
      setTranslations(loadedTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) {
      console.log(`Locale unchanged: ${newLocale}`);
      return;
    }
    console.log(`Language switched from ${locale} to ${newLocale}`);
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      // If still loading, return empty string to avoid showing keys
      if (isLoading) {
        return '';
      }
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach(paramKey => {
        value = value.replace(`{{${paramKey}}}`, String(params[paramKey]));
      });
    }

    return value;
  };

  // Show loading screen while translations are loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-teal-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
