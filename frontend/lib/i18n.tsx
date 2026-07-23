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
  settings_subtitle: {
    en: 'Manage staff accounts and facilities for your facility.',
    sw: 'Simamia akaunti za wafanyakazi na vituo kwa kituo chako.',
  },
  reports_title: { en: 'Reports', sw: 'Ripoti' },
  reports_subtitle: {
    en: "Export your facility's records as CSV for reporting.",
    sw: 'Hamisha rekodi za kituo chako kama CSV kwa ripoti.',
  },
  calendar_title: { en: 'Visit calendar', sw: 'Kalenda ya ziara' },
  calendar_subtitle: {
    en: 'Upcoming and overdue vaccine visits, by day.',
    sw: 'Ziara za chanjo zijazo na zilizochelewa, kwa siku.',
  },

  common_loading: { en: 'Loading…', sw: 'Inapakia…' },

  dash_eyebrow: { en: 'Facility overview', sw: 'Muhtasari wa kituo' },
  dash_subtitle: {
    en: 'Registrations, vaccination coverage, and nutrition risk.',
    sw: 'Usajili, ufikiaji wa chanjo, na hatari ya lishe.',
  },
  dp_children_registered: { en: 'Children registered', sw: 'Watoto waliosajiliwa' },
  dp_vaccinations_given: { en: 'Vaccinations given', sw: 'Chanjo zilizotolewa' },
  dp_malnutrition_risk: { en: 'Malnutrition risk', sw: 'Hatari ya utapiamlo' },
  dp_vaccinations_by_type: { en: 'Vaccinations by type', sw: 'Chanjo kwa aina' },
  dp_no_vaccinations: { en: 'No vaccinations recorded yet.', sw: 'Hakuna chanjo zilizorekodiwa bado.' },
  dp_overdue_vaccinations: { en: 'Overdue vaccinations', sw: 'Chanjo zilizochelewa' },
  dp_nothing_overdue: { en: 'Nothing overdue right now.', sw: 'Hakuna kilichochelewa kwa sasa.' },
  dp_due_since: { en: 'due since', sw: 'imechelewa tangu' },

  hw_eyebrow: { en: 'Health Worker Portal', sw: 'Ukurasa wa Mtoa Huduma' },
  hw_title: { en: "Your facility's patients", sw: 'Wagonjwa wa kituo chako' },
  hw_subtitle: {
    en: 'Flagged for overdue visits or nutrition risk, most recent first.',
    sw: 'Zenye alama za ziara zilizochelewa au hatari ya lishe, za hivi karibuni kwanza.',
  },
  hw_filter_placeholder: {
    en: 'Filter by name or health ID…',
    sw: 'Chuja kwa jina au kitambulisho cha afya…',
  },
  hw_scan_qr: { en: 'Scan QR', sw: 'Changanua QR' },
  hw_send_reminders: {
    en: 'Send Vaccine Reminders (SMS/WhatsApp)',
    sw: 'Tuma Vikumbusho vya Chanjo (SMS/WhatsApp)',
  },
  hw_sending: { en: 'Sending…', sw: 'Inatuma…' },
  hw_no_patients: { en: 'No patients found.', sw: 'Hakuna wagonjwa waliopatikana.' },
  hw_col_child: { en: 'Child', sw: 'Mtoto' },
  hw_col_id: { en: 'ID', sw: 'Kitambulisho' },
  hw_col_age: { en: 'Age', sw: 'Umri' },
  hw_col_last_visit: { en: 'Last Visit', sw: 'Ziara ya Mwisho' },
  hw_col_flags: { en: 'Flags', sw: 'Alama' },
  hw_open_record: { en: 'Open Record', sw: 'Fungua Rekodi' },
  hw_flag_overdue: { en: 'Overdue visit', sw: 'Ziara imechelewa' },
  hw_flag_malnutrition: { en: 'Malnutrition risk', sw: 'Hatari ya utapiamlo' },

  parent_title: { en: "Your child's health record", sw: 'Rekodi ya afya ya mtoto wako' },
  parent_subtitle: {
    en: "No account needed — just your child's QR token and phone number.",
    sw: 'Hakuna akaunti inayohitajika — tumia tu tokeni ya QR ya mtoto wako na nambari ya simu.',
  },
  pp_find_title: { en: "Find your child's record", sw: 'Tafuta rekodi ya mtoto wako' },
  pp_find_desc: {
    en: "Enter the QR token from your child's passport card and the phone number used at registration.",
    sw: 'Ingiza tokeni ya QR kutoka kadi ya pasi ya mtoto wako na nambari ya simu iliyotumika wakati wa usajili.',
  },
  pp_qr_token: { en: 'QR token', sw: 'Tokeni ya QR' },
  pp_qr_placeholder: {
    en: 'Paste or scan the token from the passport card',
    sw: 'Bandika au changanua tokeni kutoka kadi ya pasi',
  },
  pp_phone: { en: 'Phone number', sw: 'Nambari ya simu' },
  pp_looking_up: { en: 'Looking up…', sw: 'Inatafuta…' },
  pp_view_record: { en: 'View my child’s record', sw: 'Ona rekodi ya mtoto wangu' },
  pp_welcome_back: { en: 'Welcome back', sw: 'Karibu tena' },
  pp_download_cert: { en: 'Download Health Certificate', sw: 'Pakua Cheti cha Afya' },
  pp_whatsapp_on: { en: 'WhatsApp reminders on', sw: 'Vikumbusho vya WhatsApp vimewashwa' },
  pp_whatsapp_off: { en: 'WhatsApp reminders off', sw: 'Vikumbusho vya WhatsApp vimezimwa' },
  pp_upcoming: { en: 'Upcoming appointments', sw: 'Miadi ijayo' },
  pp_up_to_date: {
    en: 'Nothing due right now — fully up to date.',
    sw: 'Hakuna kinachohitajika sasa hivi — umekamilisha kila kitu.',
  },
  pp_growth_chart: { en: 'Growth chart', sw: 'Chati ya ukuaji' },
  pp_one_measurement: { en: 'One measurement so far', sw: 'Kipimo kimoja hadi sasa' },
  pp_vaccination_history: { en: 'Vaccination history', sw: 'Historia ya chanjo' },
  pp_no_vaccinations: { en: 'No vaccinations recorded yet.', sw: 'Hakuna chanjo zilizorekodiwa bado.' },
  pp_status_completed: { en: 'Completed', sw: 'Kamili' },
  pp_status_due: { en: 'Due', sw: 'Inahitajika' },
  pp_status_overdue: { en: 'Overdue', sw: 'Imechelewa' },
  pp_status_not_yet_due: { en: 'Not yet due', sw: 'Bado haijafika' },

  register_eyebrow: { en: 'New registration', sw: 'Usajili mpya' },
  register_title: { en: 'Register a child', sw: 'Sajili mtoto' },
  register_subtitle: {
    en: 'Issues a Child ID and QR passport immediately.',
    sw: 'Hutoa Kitambulisho cha Mtoto na pasi ya QR mara moja.',
  },

  children_title: { en: "Find a child's record", sw: 'Tafuta rekodi ya mtoto' },
  children_subtitle: { en: 'Search by name or health ID.', sw: 'Tafuta kwa jina au kitambulisho cha afya.' },
  cs_search_placeholder: {
    en: 'Search by name or health ID…',
    sw: 'Tafuta kwa jina au kitambulisho cha afya…',
  },
  cs_searching: { en: 'Searching…', sw: 'Inatafuta…' },
  cs_search: { en: 'Search', sw: 'Tafuta' },
  cs_no_match: { en: 'No children matched that search.', sw: 'Hakuna watoto waliolingana na utafutaji huo.' },
  cs_col_child: { en: 'Child', sw: 'Mtoto' },
  cs_col_id: { en: 'ID', sw: 'Kitambulisho' },
  cs_col_dob: { en: 'DOB', sw: 'Tarehe ya Kuzaliwa' },

  profile_eyebrow: { en: 'Child Profile', sw: 'Wasifu wa Mtoto' },
  profile_title: { en: 'Full record', sw: 'Rekodi kamili' },

  scan_eyebrow: { en: 'Facility visit', sw: 'Ziara ya kituo' },
  scan_title: { en: 'Scan & vaccinate', sw: 'Changanua na chanja' },
  scan_subtitle: {
    en: "Look up a child by their QR passport and record a vaccination against their record.",
    sw: 'Tafuta mtoto kwa pasi yao ya QR na rekodi chanjo dhidi ya rekodi yao.',
  },

  cal_prev: { en: '← Prev', sw: '← Iliyopita' },
  cal_next: { en: 'Next →', sw: 'Ijayo →' },
  cal_no_visits: {
    en: 'No due or overdue visits found for this month.',
    sw: 'Hakuna ziara zinazohitajika au zilizochelewa mwezi huu.',
  },

  rp_children: { en: 'Children', sw: 'Watoto' },
  rp_vaccination_records: { en: 'Vaccination records', sw: 'Rekodi za chanjo' },
  rp_growth_records: { en: 'Growth records', sw: 'Rekodi za ukuaji' },
  rp_children_registry_title: { en: 'Children registry', sw: 'Daftari la watoto' },
  rp_children_registry_desc: {
    en: 'Full list of children registered at your facility.',
    sw: 'Orodha kamili ya watoto waliosajiliwa katika kituo chako.',
  },
  rp_vacc_desc: {
    en: 'Every vaccination dose recorded at your facility, with who administered it.',
    sw: 'Kila dozi ya chanjo iliyorekodiwa katika kituo chako, pamoja na aliyeitoa.',
  },
  rp_growth_title: { en: 'Growth & nutrition records', sw: 'Rekodi za ukuaji na lishe' },
  rp_growth_desc: {
    en: 'Weight, height, and MUAC screening history for your facility.',
    sw: 'Historia ya uzito, urefu, na uchunguzi wa MUAC kwa kituo chako.',
  },
  rp_export_csv: { en: 'Export CSV', sw: 'Hamisha CSV' },

  st_staff_accounts: { en: 'Staff accounts', sw: 'Akaunti za wafanyakazi' },
  st_add_staff: { en: 'Add staff account', sw: 'Ongeza akaunti ya mfanyakazi' },
  st_cancel: { en: 'Cancel', sw: 'Ghairi' },
  st_full_name: { en: 'Full name', sw: 'Jina kamili' },
  st_username: { en: 'Username', sw: 'Jina la mtumiaji' },
  st_temp_password: {
    en: 'Temporary password (min 8 chars)',
    sw: 'Nenosiri la muda (herufi 8 kiwango cha chini)',
  },
  st_creating: { en: 'Creating…', sw: 'Inaunda…' },
  st_create_account: { en: 'Create account', sw: 'Unda akaunti' },
  st_col_name: { en: 'Name', sw: 'Jina' },
  st_col_role: { en: 'Role', sw: 'Wadhifa' },
  st_col_status: { en: 'Status', sw: 'Hali' },
  st_active: { en: 'Active', sw: 'Hai' },
  st_deactivated: { en: 'Deactivated', sw: 'Imezimwa' },
  st_deactivate: { en: 'Deactivate', sw: 'Zima' },
  st_reactivate: { en: 'Reactivate', sw: 'Washa tena' },
  st_facilities: { en: 'Facilities', sw: 'Vituo' },
  st_add_facility: { en: 'Add facility', sw: 'Ongeza kituo' },
  st_facility_name: { en: 'Facility name', sw: 'Jina la kituo' },
  st_region: { en: 'Region', sw: 'Mkoa' },
  st_moh_code: { en: 'MOH code', sw: 'Nambari ya MOH' },
  st_create_facility: { en: 'Create facility', sw: 'Unda kituo' },
  st_col_level: { en: 'Level', sw: 'Kiwango' },

  field_vaccine: { en: 'Vaccine', sw: 'Chanjo' },
  field_dose_number: { en: 'Dose number', sw: 'Namba ya dozi' },
  field_date_administered: { en: 'Date administered', sw: 'Tarehe ya kutolewa' },
  field_batch_number: { en: 'Batch number', sw: 'Namba ya kundi' },
  field_notes: { en: 'Notes', sw: 'Maelezo' },
  field_visit_date: { en: 'Visit date', sw: 'Tarehe ya ziara' },
  field_weight_kg: { en: 'Weight (kg)', sw: 'Uzito (kg)' },
  field_height_cm: { en: 'Height (cm)', sw: 'Urefu (cm)' },
  field_muac_cm: { en: 'MUAC (cm)', sw: 'MUAC (cm)' },
  common_cancel: { en: 'Cancel', sw: 'Ghairi' },
  common_edit: { en: 'Edit', sw: 'Hariri' },
  common_saving: { en: 'Saving…', sw: 'Inahifadhi…' },
  common_save_changes: { en: 'Save changes', sw: 'Hifadhi mabadiliko' },

  nutr_normal: { en: 'Normal', sw: 'Kawaida' },
  nutr_moderate: { en: 'Moderate acute malnutrition', sw: 'Utapiamlo wa wastani' },
  nutr_severe: { en: 'Severe acute malnutrition', sw: 'Utapiamlo mkali' },

  vp_scan_title: { en: 'Scan child passport', sw: 'Changanua pasi ya mtoto' },
  vp_qr_placeholder: {
    en: "Paste or scan the token from the child's QR passport",
    sw: 'Bandika au changanua tokeni kutoka pasi ya QR ya mtoto',
  },
  vp_looking_up: { en: 'Looking up…', sw: 'Inatafuta…' },
  vp_find_child: { en: 'Find child', sw: 'Tafuta mtoto' },
  vp_child_label: { en: 'Child', sw: 'Mtoto' },
  vp_vaccination_history: { en: 'Vaccination history', sw: 'Historia ya chanjo' },
  vp_no_vaccinations: { en: 'No vaccinations recorded yet.', sw: 'Hakuna chanjo zilizorekodiwa bado.' },
  vp_record_new_vaccination: { en: 'Record a new vaccination', sw: 'Rekodi chanjo mpya' },
  vp_vaccination_recorded: { en: 'Vaccination recorded.', sw: 'Chanjo imerekodiwa.' },
  vp_record_vaccination: { en: 'Record vaccination', sw: 'Rekodi chanjo' },
  vp_recording: { en: 'Recording…', sw: 'Inarekodi…' },
  vp_growth_history: { en: 'Growth history', sw: 'Historia ya ukuaji' },
  vp_no_measurements: { en: 'No measurements recorded yet.', sw: 'Hakuna vipimo vilivyorekodiwa bado.' },
  vp_record_growth_measurement: { en: 'Record growth measurement', sw: 'Rekodi kipimo cha ukuaji' },
  vp_measurement_recorded: { en: 'Measurement recorded.', sw: 'Kipimo kimerekodiwa.' },
  vp_save_measurement: { en: 'Save measurement', sw: 'Hifadhi kipimo' },

  reg_passport_issued: { en: 'Passport issued', sw: 'Pasi imetolewa' },
  reg_another_child: { en: 'Register another child', sw: 'Sajili mtoto mwingine' },
  reg_child_details: { en: 'Child details', sw: 'Maelezo ya mtoto' },
  reg_full_name: { en: 'Full name', sw: 'Jina kamili' },
  reg_dob: { en: 'Date of birth', sw: 'Tarehe ya kuzaliwa' },
  reg_sex: { en: 'Sex', sw: 'Jinsia' },
  reg_female: { en: 'Female', sw: 'Mke' },
  reg_male: { en: 'Male', sw: 'Mume' },
  reg_birth_weight: { en: 'Birth weight (kg)', sw: 'Uzito wa kuzaliwa (kg)' },
  reg_region: { en: 'Region', sw: 'Mkoa' },
  reg_district: { en: 'District', sw: 'Wilaya' },
  reg_continue_guardian: { en: 'Continue to guardian details', sw: 'Endelea na maelezo ya mlezi' },
  reg_guardian_details: { en: 'Guardian details', sw: 'Maelezo ya mlezi' },
  reg_relation: { en: 'Relation to child', sw: 'Uhusiano na mtoto' },
  reg_mother: { en: 'Mother', sw: 'Mama' },
  reg_father: { en: 'Father', sw: 'Baba' },
  reg_guardian: { en: 'Guardian', sw: 'Mlezi' },
  reg_phone: { en: 'Phone number', sw: 'Nambari ya simu' },
  reg_whatsapp_optin: {
    en: 'Send vaccination reminders on WhatsApp',
    sw: 'Tuma vikumbusho vya chanjo kwa WhatsApp',
  },
  reg_back: { en: 'Back', sw: 'Rudi' },
  reg_issuing: { en: 'Issuing passport…', sw: 'Inatoa pasi…' },
  reg_submit: { en: 'Register child & issue passport', sw: 'Sajili mtoto na toa pasi' },

  cp_nutrition_label: { en: 'Nutrition', sw: 'Lishe' },
  cp_weight: { en: 'Weight', sw: 'Uzito' },
  cp_height: { en: 'Height', sw: 'Urefu' },
  cp_muac: { en: 'MUAC', sw: 'MUAC' },
  cp_growth_chart_title: { en: 'Growth chart — weight over time', sw: 'Chati ya ukuaji — uzito kwa muda' },
  cp_no_weight_measurements: {
    en: 'No weight measurements recorded yet.',
    sw: 'Hakuna vipimo vya uzito vilivyorekodiwa bado.',
  },
  cp_trend_line_hint: {
    en: 'record another visit to see a trend line.',
    sw: 'rekodi ziara nyingine kuona mwelekeo.',
  },
  cp_vaccination_tracker: { en: 'Vaccination tracker', sw: 'Kifuatiliaji cha chanjo' },
  cp_col_scheduled: { en: 'Scheduled', sw: 'Imepangwa' },
  cp_col_status: { en: 'Status', sw: 'Hali' },
  cp_record_vaccination_btn: { en: '+ Record vaccination', sw: '+ Rekodi chanjo' },
  cp_record_growth_btn: { en: '+ Record growth measurement', sw: '+ Rekodi kipimo cha ukuaji' },
  cp_save_vaccination: { en: 'Save vaccination', sw: 'Hifadhi chanjo' },

  pc_tagline: { en: 'Digital Child Health Passport', sw: 'Pasi ya Kidijitali ya Afya ya Mtoto' },
  pc_child_id: { en: 'Child ID', sw: 'Kitambulisho cha Mtoto' },
  pc_name: { en: 'Name', sw: 'Jina' },
  pc_motto: { en: 'Every Child. Every Visit. Everywhere.', sw: 'Kila Mtoto. Kila Ziara. Kila Mahali.' },

  st_col_phone: { en: 'Phone', sw: 'Simu' },
  st_col_facility: { en: 'Facility', sw: 'Kituo' },
  st_col_employee_number: { en: 'Employee No.', sw: 'Namba ya Mtumishi' },
  st_phone_placeholder: { en: 'Phone number', sw: 'Nambari ya simu' },
  st_employee_number_placeholder: { en: 'Government employee number', sw: 'Namba ya mtumishi wa serikali' },
  record_recorded_by: { en: 'Recorded by', sw: 'Imerekodiwa na' },
  record_at_facility: { en: 'at', sw: 'katika' },
  record_employee_no: { en: 'Employee No.', sw: 'Namba ya Mtumishi' },
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
