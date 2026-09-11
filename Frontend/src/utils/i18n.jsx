/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const translations = {
  en: {
    home: "Home",
    about: "About",
    skills: "Skills",
    projects: "Projects",
    services: "Services",
    contact: "Contact",
    letsTalk: "Let's Talk",
    viewWork: "View My Work",
    workTogether: "Let's Work Together",
    searchProjects: "Search projects, skills or clients...",
    searchArticles: "Search articles...",
    readMore: "Read more",
    downloadCv: "Download CV",
    bookCall: "Book a call",
    whatsapp: "WhatsApp",
    language: "Language",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    skills: "Compétences",
    projects: "Projets",
    services: "Services",
    contact: "Contact",
    letsTalk: "Parlons-en",
    viewWork: "Voir mes travaux",
    workTogether: "Travaillons ensemble",
    searchProjects: "Rechercher des projets, compétences ou clients...",
    searchArticles: "Rechercher des articles...",
    readMore: "Lire la suite",
    downloadCv: "Télécharger le CV",
    bookCall: "Réserver un appel",
    whatsapp: "WhatsApp",
    language: "Langue",
  },
  es: {
    home: "Inicio",
    about: "Sobre mí",
    skills: "Habilidades",
    projects: "Proyectos",
    services: "Servicios",
    contact: "Contacto",
    letsTalk: "Hablemos",
    viewWork: "Ver mi trabajo",
    workTogether: "Trabajemos juntos",
    searchProjects: "Buscar proyectos, habilidades o clientes...",
    searchArticles: "Buscar artículos...",
    readMore: "Leer más",
    downloadCv: "Descargar CV",
    bookCall: "Reservar una llamada",
    whatsapp: "WhatsApp",
    language: "Idioma",
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("portfolioLanguage") || "en"
  );

  useEffect(() => {
    localStorage.setItem("portfolioLanguage", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language]?.[key] || translations.en[key] || key,
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used inside I18nProvider");
  }
  return context;
}
