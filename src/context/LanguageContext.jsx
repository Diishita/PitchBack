import { createContext, useState } from 'react';
import { translations } from '../translations';

// Fast Refresh intentionally shares this context object with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cricket_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cricket_lang', lang);
  };

  const localizeDigits = (val) => {
    if (val === undefined || val === null) return '';
    const str = val.toString();
    if (language === 'en') return str;
    
    const digits = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };
    
    return str.replace(/[0-9]/g, (d) => digits[d]);
  };

  const t = (key) => {
    const langObj = translations[language] || translations['en'];
    let text = langObj[key] || translations['en'][key] || key;
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, localizeDigits }}>
      {children}
    </LanguageContext.Provider>
  );
};
