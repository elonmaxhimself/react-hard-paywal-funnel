import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import cs from './locales/cs.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import el from './locales/el.json';
import hu from './locales/hu.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  cs: { translation: cs },
  fr: { translation: fr },
  de: { translation: de },
  el: { translation: el },
  hu: { translation: hu },
  it: { translation: it },
  pl: { translation: pl },
  pt: { translation: pt },
  es: { translation: es }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'cs', 'fr', 'de', 'el', 'hu', 'it', 'pl', 'pt', 'es'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;