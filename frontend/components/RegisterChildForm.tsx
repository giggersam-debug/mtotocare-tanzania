'use client';

import { useState, type ReactNode } from 'react';
import { registerChild, type RegisterChildResponse } from '@/lib/api';
import { PassportCard } from './PassportCard';
import { useLanguage } from '@/lib/i18n';

type Step = 'child' | 'guardian' | 'success';

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
};

export function RegisterChildForm({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('child');
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
            setStep('child');
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
        <div className={`h-1 flex-1 rounded-full ${step === 'child' ? 'bg-blue' : 'bg-green'}`} />
        <div className={`h-1 flex-1 rounded-full ${step === 'guardian' ? 'bg-blue' : 'bg-slate-200'}`} />
      </div>

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

          <button onClick={() => setStep('guardian')} disabled={!form.fullName || !form.dateOfBirth} className="btn-primary">
            {t('reg_continue_guardian')}
          </button>
        </div>
      )}

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

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep('child')} className="btn-secondary">
              {t('reg_back')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.guardianFullName || !form.guardianPhone}
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
