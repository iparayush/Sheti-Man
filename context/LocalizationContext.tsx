
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../locales';
import { Language } from '../types';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, key: string): any => {
  try {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  } catch (error) {
    return undefined;
  }
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Defaulting to Marathi as requested
  const [language, setLanguage] = useState<Language>('mr');

  const t = useCallback((key: string): string => {
    const translationSet = getNestedTranslation(translations, key) as Record<string, any> | undefined;
    
    if (!translationSet || typeof translationSet[language] === 'undefined') {
      const fallbackSet = getNestedTranslation(translations, key) as Record<string, any> | undefined;
      return fallbackSet?.['en'] || key;
    }
    
    return translationSet[language];
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
