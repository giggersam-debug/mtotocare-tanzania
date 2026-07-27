'use client';

import { useState, type ReactNode } from 'react';
import {
  recordMaternalHealthForGuardian,
  registerGuardian,
  type ArtAdherence,
  type GuardianRecord,
  type HivStatus,
} from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

type Step = 'guardian' | 'maternal' | 'success';

const initialState = {
  fullName: '',
  relation: 'mother' as 'mother' | 'father' | 'guardian',
  phone: '',
  whatsappOptIn: true,
  nationalIdRef: '',
  occupation: '',
  residence: '',
  gravida: '',
  para: '',
  estimatedDueDate: '',
  ancVisits: '',
  gestationalAgeWeeks: '',
  gestationalDiabetes: false,
  hypertension: false,
  anemia: false,
  malariaInPregnancy: false,
  hivStatus: 'unknown' as HivStatus,
  artAdherence: '' as ArtAdherence | '',
  geneticFamilyHistory: '',
  maternalConsent: false,
};

export function RegisterMotherForm({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('guardian');
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardian, setGuardian] = useState<GuardianRecord | null>(null);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleRegisterGuardian() {
    setSubmitting(true);
    setError(null);
    try {
      const created = await registerGuardian(
        {
          fullName: form.fullName,
          relation: form.relation,
          phone: form.phone,
          whatsappOptIn: form.whatsappOptIn,
          nationalIdRef: form.nationalIdRef || undefined,
          occupation: form.occupation,
          residence: form.residence,
        },
        accessToken,
      );
      setGuardian(created);
      setStep('maternal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register the mother/guardian.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish(withMaternal: boolean) {
    if (!guardian) return;
    setSubmitting(true);
    setError(null);
    try {
      if (withMaternal && form.maternalConsent) {
        await recordMaternalHealthForGuardian(
          {
            guardianId: guardian.guardianId,
            gravida: form.gravida ? Number(form.gravida) : undefined,
            para: form.para ? Number(form.para) : undefined,
            estimatedDueDate: form.estimatedDueDate || undefined,
            ancVisits: form.ancVisits ? Number(form.ancVisits) : undefined,
            gestationalAgeWeeks: form.gestationalAgeWeeks ? Number(form.gestationalAgeWeeks) : undefined,
            gestationalDiabetes: form.gestationalDiabetes,
            hypertension: form.hypertension,
            anemia: form.anemia,
            malariaInPregnancy: form.malariaInPregnancy,
            hivStatus: form.hivStatus,
            artAdherence: form.artAdherence || undefined,
            geneticFamilyHistory: form.geneticFamilyHistory || undefined,
            consentGiven: form.maternalConsent,
          },
          accessToken,
        );
      }
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the pregnancy history.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success' && guardian) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-green">{t('rm_success_title')}</p>
        <p className="text-lg font-bold text-slate-900">{guardian.fullName}</p>
        <p className="text-sm text-slate-500">{guardian.phone}</p>
        <p className="text-sm text-slate-500">{t('rm_success_body')}</p>
        <button
          onClick={() => {
            setForm(initialState);
            setGuardian(null);
            setStep('guardian');
          }}
          className="text-sm font-semibold text-blue underline underline-offset-4"
        >
          {t('rm_register_another')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === 'guardian' ? 'bg-blue' : 'bg-green'}`} />
        <div className={`h-1 flex-1 rounded-full ${step === 'maternal' ? 'bg-blue' : 'bg-slate-200'}`} />
      </div>

      {step === 'guardian' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t('reg_guardian_details')}</h2>

          <Field label={t('reg_full_name')}>
            <input className="input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_relation')}>
              <select
                className="input"
                value={form.relation}
                onChange={(e) => update('relation', e.target.value as typeof form.relation)}
              >
                <option value="mother">{t('reg_mother')}</option>
                <option value="father">{t('reg_father')}</option>
                <option value="guardian">{t('reg_guardian')}</option>
              </select>
            </Field>
            <Field label={t('reg_phone')}>
              <input
                className="input"
                placeholder="+255 7xx xxx xxx"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </Field>
          </div>

          <Field label={form.relation === 'guardian' ? t('rm_national_id') : `${t('rm_national_id')} *`}>
            <input
              className="input"
              value={form.nationalIdRef}
              onChange={(e) => update('nationalIdRef', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={`${t('reg_occupation')} *`}>
              <input className="input" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
            </Field>
            <Field label={`${t('reg_residence')} *`}>
              <input className="input" value={form.residence} onChange={(e) => update('residence', e.target.value)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.whatsappOptIn}
              onChange={(e) => update('whatsappOptIn', e.target.checked)}
            />
            {t('reg_whatsapp_optin')}
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            onClick={handleRegisterGuardian}
            disabled={
              submitting ||
              !form.fullName ||
              !form.phone ||
              !form.occupation ||
              !form.residence ||
              (form.relation !== 'guardian' && !form.nationalIdRef)
            }
            className="btn-primary"
          >
            {submitting ? t('rm_registering') : t('rm_register_btn')}
          </button>
        </div>
      )}

      {step === 'maternal' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t('reg_maternal_title')}</h2>
          <p className="text-sm text-slate-500">{t('reg_maternal_subtitle')}</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_gravida')}>
              <input className="input" value={form.gravida} onChange={(e) => update('gravida', e.target.value)} />
            </Field>
            <Field label={t('reg_para')}>
              <input className="input" value={form.para} onChange={(e) => update('para', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_edd')}>
              <input
                type="date"
                className="input"
                value={form.estimatedDueDate}
                onChange={(e) => update('estimatedDueDate', e.target.value)}
              />
            </Field>
            <Field label={t('reg_anc_visits')}>
              <input className="input" value={form.ancVisits} onChange={(e) => update('ancVisits', e.target.value)} />
            </Field>
          </div>

          <Field label={t('reg_gestational_age')}>
            <input
              className="input"
              value={form.gestationalAgeWeeks}
              onChange={(e) => update('gestationalAgeWeeks', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.gestationalDiabetes}
                onChange={(e) => update('gestationalDiabetes', e.target.checked)}
              />
              {t('reg_gestational_diabetes')}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.hypertension}
                onChange={(e) => update('hypertension', e.target.checked)}
              />
              {t('reg_hypertension')}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.anemia} onChange={(e) => update('anemia', e.target.checked)} />
              {t('reg_anemia')}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.malariaInPregnancy}
                onChange={(e) => update('malariaInPregnancy', e.target.checked)}
              />
              {t('reg_malaria')}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_hiv_status')}>
              <select
                className="input"
                value={form.hivStatus}
                onChange={(e) => update('hivStatus', e.target.value as HivStatus)}
              >
                <option value="unknown">{t('reg_hiv_unknown')}</option>
                <option value="negative">{t('reg_hiv_negative')}</option>
                <option value="positive">{t('reg_hiv_positive')}</option>
              </select>
            </Field>
            <Field label={t('reg_art_adherence')}>
              <select
                className="input"
                value={form.artAdherence}
                onChange={(e) => update('artAdherence', e.target.value as ArtAdherence | '')}
              >
                <option value="">—</option>
                <option value="good">{t('reg_art_good')}</option>
                <option value="fair">{t('reg_art_fair')}</option>
                <option value="poor">{t('reg_art_poor')}</option>
                <option value="n/a">{t('reg_art_na')}</option>
              </select>
            </Field>
          </div>

          <Field label={t('reg_genetic_family_history')}>
            <textarea
              className="input"
              rows={2}
              value={form.geneticFamilyHistory}
              onChange={(e) => update('geneticFamilyHistory', e.target.value)}
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.maternalConsent}
              onChange={(e) => update('maternalConsent', e.target.checked)}
            />
            {t('reg_maternal_consent')}
          </label>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => handleFinish(false)} disabled={submitting} className="btn-secondary">
              {t('reg_skip_maternal')}
            </button>
            <button
              onClick={() => handleFinish(true)}
              disabled={submitting || !form.maternalConsent}
              className="btn-primary"
            >
              {submitting ? t('rm_registering') : t('reg_save_maternal')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}
