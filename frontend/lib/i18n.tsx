'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'sw';

const DICTIONARY = {
  nav_home: { en: 'Home', sw: 'Nyumbani' },
  nav_registration: { en: 'Registration', sw: 'Usajili' },
  nav_child_lookup: { en: 'Child Lookup', sw: 'Tafuta Mtoto' },
  nav_vaccinations: { en: 'Vaccinations', sw: 'Chanjo' },
  nav_parent_portal: { en: 'Parent Portal', sw: 'Ukurasa wa Mzazi' },
  nav_health_worker: { en: 'Health Worker', sw: 'Mtoa Huduma' },
  nav_dashboard: { en: 'Dashboard', sw: 'Dashibodi' },
  nav_calendar: { en: 'Calendar', sw: 'Kalenda' },
  nav_reports: { en: 'Reports', sw: 'Ripoti' },
  nav_settings: { en: 'Settings', sw: 'Mipangilio' },
  nav_sign_out: { en: 'Sign out', sw: 'Toka' },
  nav_tagline: { en: 'Digital Child Health Record', sw: 'Rekodi ya Afya ya Mtoto Kidijitali' },

  home_eyebrow: { en: 'National Digital Health Initiative · Tanzania', sw: 'Mpango wa Kitaifa wa Afya Kidijitali · Tanzania' },
  home_title: { en: 'Every child deserves a lifelong health record', sw: 'Kila mtoto anastahili rekodi ya afya ya maisha yote' },
  home_subtitle: {
    en: 'Securely accessible from any authorized health facility nationwide — replacing the paper RCH booklet with a digital child health passport.',
    sw: 'Inapatikana kwa usalama kutoka kituo chochote cha afya kilichoidhinishwa nchini — ikichukua nafasi ya kijitabu cha karatasi cha RCH kwa pasi ya afya ya mtoto ya kidijitali.',
  },
  home_cta_register: { en: 'Register a Child', sw: 'Sajili Mtoto' },
  home_cta_login: { en: 'Health Worker Login', sw: 'Ingia kama Mtoa Huduma' },
  home_cta_parent: { en: 'Parent Portal', sw: 'Ukurasa wa Mzazi' },
  home_badge_qr_label: { en: 'QR', sw: 'QR' },
  home_badge_qr_desc: { en: 'Scan to open record', sw: 'Changanua kufungua rekodi' },
  home_badge_growth_label: { en: 'Growth', sw: 'Ukuaji' },
  home_badge_growth_desc: { en: 'WHO MUAC screening', sw: 'Uchunguzi wa MUAC wa WHO' },
  home_badge_epi_label: { en: 'EPI', sw: 'EPI' },
  home_badge_epi_desc: { en: 'Vaccination schedule', sw: 'Ratiba ya chanjo' },
  home_badge_live_label: { en: 'Live', sw: 'Papo Hapo' },
  home_badge_live_desc: { en: 'Facility dashboard', sw: 'Dashibodi ya kituo' },
  home_trust_title: { en: 'Trusted by health workers across Tanzania', sw: 'Inaaminiwa na watoa huduma za afya nchini Tanzania' },
  home_trust_body: {
    en: 'Nurses, doctors, and community health workers use MtotoCare every day to register births, record vaccinations and growth checks, and follow up with families before a visit is missed.',
    sw: 'Wauguzi, madaktari, na watoa huduma za afya jamii wanatumia MtotoCare kila siku kusajili vizazi, kurekodi chanjo na ukuaji, na kufuatilia familia kabla ya ziara kukosekana.',
  },

  login_title: { en: 'Facility staff sign in', sw: 'Ingia kama mfanyakazi wa kituo' },
  login_username: { en: 'Username', sw: 'Jina la mtumiaji' },
  login_password: { en: 'Password', sw: 'Nenosiri' },
  login_submit: { en: 'Sign in', sw: 'Ingia' },
  login_submitting: { en: 'Signing in…', sw: 'Inaingia…' },

  settings_title: { en: 'Facility & staff settings', sw: 'Mipangilio ya kituo na wafanyakazi' },
  reports_title: { en: 'Reports', sw: 'Ripoti' },
  calendar_title: { en: 'Visit calendar', sw: 'Kalenda ya ziara' },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem('mtotocare_lang');
    if (stored === 'en' || stored === 'sw') setLanguageState(stored);
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    window.localStorage.setItem('mtotocare_lang', lang);
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => DICTIONARY[key][language],
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
