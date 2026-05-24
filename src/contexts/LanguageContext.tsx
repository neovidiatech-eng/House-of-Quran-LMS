import { useTranslation } from 'react-i18next';

export type Language = 'ar' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

/**
 * Bridge hook: wraps react-i18next's useTranslation to provide the same API
 * that all existing components expect from the old LanguageContext.
 */
export function useLanguage(): LanguageContextType {
  const { t, i18n } = useTranslation();
  const language = (i18n.language?.split('-')[0] || 'en') as Language;

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return { language, setLanguage, toggleLanguage, t };
}
