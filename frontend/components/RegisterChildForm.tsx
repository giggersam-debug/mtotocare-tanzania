'use client';

import { useState, type ReactNode } from 'react';
import {
  recordMaternalHealth,
  registerChild,
  type ArtAdherence,
  type DeliveryMode,
  type HivStatus,
  type RegisterChildResponse,
} from '@/lib/api';
import { PassportCard } from './PassportCard';
import { useLanguage } from '@/lib/i18n';

// Mother/guardian first, then her pregnancy history, then the child's own
// details last (entered after birth) — matches the real-world order these
// facts become known in.
type Step = 'guardian' | 'maternal' | 'child' | 'success';

const initialState = {
  fullName: '',
  dateOfBirth: '',
  sex: 'female' as 'male' | 'female',
  birthWeightKg: '',
  region: '',
  district: '',
  guardianFullName: '',
  guardianRelation: 'mother' as 'mother' | 'father' | 'guardian',
  guardianPhone: '',
  whatsappOptIn: true,
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
  deliveryMode: '' as DeliveryMode | '',
  apgarScore: '',
  deliveryComplications: '',
  geneticFamilyHistory: '',
  maternalConsent: false,
};

export function RegisterChildForm({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('guardian');
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterChildResponse | null>(null);

  function update<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await registerChild(
        {
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
          sex: form.sex,
          birthWeightKg: form.birthWeightKg ? Number(form.birthWeightKg) : undefined,
          region: form.region,
          district: form.district,
          guardian: {
            fullName: form.guardianFullName,
            relation: form.guardianRelation,
            phone: form.guardianPhone,
            whatsappOptIn: form.whatsappOptIn,
          },
        },
        accessToken,
      );

      // Only persisted if the mother's consent was given on the maternal
      // history step — the backend enforces this too, but skip the call
      // entirely rather than let it fail server-side.
      if (form.maternalConsent) {
        try {
          await recordMaternalHealth(
            {
              childId: response.child.childId,
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
              deliveryMode: form.deliveryMode || undefined,
              apgarScore: form.apgarScore ? Number(form.apgarScore) : undefined,
              deliveryComplications: form.deliveryComplications || undefined,
              geneticFamilyHistory: form.geneticFamilyHistory || undefined,
              consentGiven: form.maternalConsent,
            },
            accessToken,
          );
        } catch (mErr) {
          // Child registration already succeeded and the passport is issued —
          // don't block that on a maternal-history save failure.
          console.error('Could not save the maternal health record:', mErr);
        }
      }

      setResult(response);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'success' && result) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="text-sm font-semibold text-green">{t('reg_passport_issued')}</p>
        <PassportCard
          childName={result.child.fullName}
          dateOfBirth={result.child.dateOfBirth}
          childId={result.child.childId}
          qrCodeImage={result.qrCodeImage}
          qrToken={result.child.qrToken}
        />
        <button
          onClick={() => {
            setForm(initialState);
            setResult(null);
            setStep('guardian');
          }}
          className="text-sm font-semibold text-blue underline underline-offset-4"
        >
          {t('reg_another_child')}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === 'guardian' ? 'bg-blue' : 'bg-green'}`} />
        <div
          className={`h-1 flex-1 rounded-full ${
            step === 'maternal' ? 'bg-blue' : step === 'child' || step === 'success' ? 'bg-green' : 'bg-slate-200'
          }`}
        />
        <div className={`h-1 flex-1 rounded-full ${step === 'child' ? 'bg-blue' : 'bg-slate-200'}`} />
      </div>

      {step === 'guardian' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t('reg_guardian_details')}</h2>

          <Field label={t('reg_full_name')}>
            <input
              className="input"
              value={form.guardianFullName}
              onChange={(e) => update('guardianFullName', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_relation')}>
              <select
                className="input"
                value={form.guardianRelation}
                onChange={(e) => update('guardianRelation', e.target.value as typeof form.guardianRelation)}
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
                value={form.guardianPhone}
                onChange={(e) => update('guardianPhone', e.target.value)}
              />
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

          <button
            onClick={() => setStep('maternal')}
            disabled={!form.guardianFullName || !form.guardianPhone}
            className="btn-primary"
          >
            {t('reg_continue')}
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

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_delivery_mode')}>
              <select
                className="input"
                value={form.deliveryMode}
                onChange={(e) => update('deliveryMode', e.target.value as DeliveryMode | '')}
              >
                <option value="">—</option>
                <option value="vaginal">{t('reg_delivery_vaginal')}</option>
                <option value="cesarean">{t('reg_delivery_cesarean')}</option>
                <option value="assisted">{t('reg_delivery_assisted')}</option>
              </select>
            </Field>
            <Field label={t('reg_apgar_score')}>
              <input className="input" value={form.apgarScore} onChange={(e) => update('apgarScore', e.target.value)} />
            </Field>
          </div>

          <Field label={t('reg_delivery_complications')}>
            <textarea
              className="input"
              rows={2}
              value={form.deliveryComplications}
              onChange={(e) => update('deliveryComplications', e.target.value)}
            />
          </Field>

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

          <div className="flex gap-3">
            <button onClick={() => setStep('guardian')} className="btn-secondary">
              {t('reg_back')}
            </button>
            <button onClick={() => setStep('child')} className="btn-primary">
              {t('reg_continue')}
            </button>
          </div>
        </div>
      )}

      {step === 'child' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t('reg_child_details')}</h2>

          <Field label={t('reg_full_name')}>
            <input className="input" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_dob')}>
              <input
                type="date"
                className="input"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
              />
            </Field>
            <Field label={t('reg_sex')}>
              <select className="input" value={form.sex} onChange={(e) => update('sex', e.target.value as 'male' | 'female')}>
                <option value="female">{t('reg_female')}</option>
                <option value="male">{t('reg_male')}</option>
              </select>
            </Field>
          </div>

          <Field label={t('reg_birth_weight')}>
            <input className="input" value={form.birthWeightKg} onChange={(e) => update('birthWeightKg', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t('reg_region')}>
              <input className="input" value={form.region} onChange={(e) => update('region', e.target.value)} />
            </Field>
            <Field label={t('reg_district')}>
              <input className="input" value={form.district} onChange={(e) => update('district', e.target.value)} />
            </Field>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('maternal')} className="btn-secondary">
              {t('reg_back')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.fullName || !form.dateOfBirth}
              className="btn-primary"
            >
              {submitting ? t('reg_issuing') : t('reg_submit')}
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
