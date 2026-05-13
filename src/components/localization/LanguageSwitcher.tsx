'use client';

import { useLocale } from '@/lib/i18n/context';
import { locales } from '@/lib/i18n/types';
import { Globe } from 'lucide-react';
import { useCallback } from 'react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as 'en' | 'am';
    console.log(`LanguageSwitcher: User manually changed language to ${newLocale}`);
    setLocale(newLocale);
  }, [setLocale]);

  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={handleLocaleChange}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.nativeName}
          </option>
        ))}
      </select>
      <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
