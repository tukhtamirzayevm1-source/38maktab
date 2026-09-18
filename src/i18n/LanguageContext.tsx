import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('maktab38_language');
    if (saved === 'UZ' || saved === 'RU' || saved === 'EN') {
      return saved;
    }
    return 'UZ'; // Default is Uzbek as requested
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('maktab38_language', lang);
    document.documentElement.lang = lang.toLowerCase();
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const t = (key: string): string => {
    const currentDict = translations[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to UZ then EN
    return translations.UZ[key] || translations.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, currentLanguage: language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
