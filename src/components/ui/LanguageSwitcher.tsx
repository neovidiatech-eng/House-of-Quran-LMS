import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  const toggleLanguage = () => {
    const nextLang = currentLang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 
                   rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 
                   group overflow-hidden relative"
      >
        <div className="flex items-center gap-2 font-semibold text-gray-700 group-hover:text-primary">
          <span className="text-sm ">{currentLang === 'ar' ? 'English' : 'عربي'}</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      </button>
    </div>
  );
}
