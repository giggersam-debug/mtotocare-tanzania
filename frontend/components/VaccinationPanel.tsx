'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import {
  getGrowthHistory,
  getVaccinationHistory,
  lookupChildByQr,
  recordGrowth,
  recordVaccination,
  VACCINE_CODES,
  type ChildSummary,
  type GrowthRecord,
  type VaccinationRecord,
} from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const today = () => new Date().toISOString().slice(0, 10);

function recorderMeta(
  name: string | null | undefined,
  phone: string | null | undefined,
  facility: string | null | undefined,
  t: (key: any) => string,
): string | null {
  if (!name) return null;
  const parts = [`${t('record_recorded_by')} ${name}`];
  if (phone) parts.push(phone);
  if (facility) parts.push(`${t('record_at_facility')} ${facility}`);
  return parts.join(' · ');
}

export function VaccinationPanel({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const NUTRITIONAL_STATUS_LABEL: Record<string, string> = {
    normal: t('nutr_normal'),
    moderate_acute_malnutrition: t('nutr_moderate'),
    severe_acute_malnutrition: t('nutr_severe'),
  };
  const [qrToken, setQrToken] = useState('');
  const [child, setChild] = useState<ChildSummary | null>(null);
  const [history, setHistory] = useState<VaccinationRecord[]>([]);
  const [growthHistory, setGrowthHistory] = useState<GrowthRecord[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const [vaccineCode, setVaccineCode] = useState<(typeof VACCINE_CODES)[number]>('BCG');
  const [doseNumber, setDoseNumber] = useState('');
  const [administeredAt, setAdministeredAt] = useState(today());
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [justRecorded, setJustRecorded] = useState(false);

  const [visitDate, setVisitDate] = useState(today());
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [muacCm, setMuacCm] = useState('');
  const [growthNotes, setGrowthNotes] = useState('');
  const [growthError, setGrowthError] = useState<string | null>(null);
  const [savingGrowth, setSavingGrowth] = useState(false);
  const [justSavedGrowth, setJustSavedGrowth] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    if (!qrToken.trim()) return;
    setLooking(true);
    setLookupError(null);
    setChild(null);
    setJustRecorded(false);
    setJustSavedGrowth(false);
    try {
      const summary = await lookupChildByQr(qrToken.trim(), accessToken);
      setChild(summary);
      const [vaccinations, growth] = await Promise.all([
        getVaccinationHistory(summary.childId, accessToken),
        getGrowthHistory(summary.childId, accessToken),
      ]);
      setHistory(vaccinations);
      setGrowthHistory(growth);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setLooking(false);
    }
  }

  async function handleRecord(e: FormEvent) {
    e.preventDefault();
    if (!child) return;
    setRecording(true);
    setRecordError(null);
    try {
      await recordVaccination(
        {
          childId: child.childId,
          vaccineCode,
          doseNumber: doseNumber ? Number(doseNumber) : undefined,
          administeredAt,
          batchNumber: batchNumber || undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      const records = await getVaccinationHistory(child.childId, accessToken);
      setHistory(records);
      setDoseNumber('');
      setBatchNumber('');
      setNotes('');
      setJustRecorded(true);
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : 'Could not record the vaccination.');
    } finally {
      setRecording(false);
    }
  }

  async function handleRecordGrowth(e: FormEvent) {
    e.preventDefault();
    if (!child) return;
    setSavingGrowth(true);
    setGrowthError(null);
    try {
      await recordGrowth(
        {
          childId: child.childId,
          visitDate,
          weightKg: weightKg ? Number(weightKg) : undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          muacCm: muacCm ? Number(muacCm) : undefined,
          notes: growthNotes || undefined,
        },
        accessToken,
      );
      const records = await getGrowthHistory(child.childId, accessToken);
      setGrowthHistory(records);
      setWeightKg('');
      setHeightCm('');
      setMuacCm('');
      setGrowthNotes('');
      setJustSavedGrowth(true);
    } catch (err) {
      setGrowthError(err instanceof Error ? err.message : 'Could not record the measurement.');
    } finally {
      setSavingGrowth(false);
    }
  }

  const latestGrowth = growthHistory[growthHistory.length - 1];

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <form
        onSubmit={handleLookup}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-slate-900">{t('vp_scan_title')}</h2>
        <Field label={t('pp_qr_token')}>
          <input
            className="input font-mono text-xs"
            placeholder={t('vp_qr_placeholder')}
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
          />
        </Field>
        {lookupError && <p className="text-sm font-medium text-red-600">{lookupError}</p>}
        <button type="submit" disabled={looking || !qrToken.trim()} className="btn-primary">
          {looking ? t('vp_looking_up') : t('vp_find_child')}
        </button>
      </form>

      {child && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">{t('vp_child_label')}</p>
              <p className="text-lg font-bold text-slate-900">{child.fullName}</p>
              <p className="text-sm text-slate-500">
                DOB {child.dateOfBirth} · {child.sex === 'female' ? t('reg_female') : t('reg_male')}
              </p>
            </div>
            {latestGrowth?.nutritionalStatus && latestGrowth.nutritionalStatus !== 'normal' && (
              <span className="whitespace-nowrap rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                {NUTRITIONAL_STATUS_LABEL[latestGrowth.nutritionalStatus]}
              </span>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('vp_vaccination_history')}
            </p>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400">{t('vp_no_vaccinations')}</p>
            ) : (
              <ul className="space-y-1">
                {history.map((v) => (
                  <li
                    key={v.vaccinationId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-700">
                      {v.vaccineCode}
                      {v.doseNumber ? ` · dose ${v.doseNumber}` : ''}
                    </span>
                    <span className="text-right text-xs text-slate-500">
                      {v.administeredAt}
                      {recorderMeta(v.administeredByName, v.administeredByPhone, v.facilityName, t) && (
                        <span className="block text-slate-400">
                          {recorderMeta(v.administeredByName, v.administeredByPhone, v.facilityName, t)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleRecord} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('vp_record_new_vaccination')}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('field_vaccine')}>
                <select
                  className="input"
                  value={vaccineCode}
                  onChange={(e) => setVaccineCode(e.target.value as (typeof VACCINE_CODES)[number])}
                >
                  {VACCINE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('field_dose_number')}>
                <input
                  className="input"
                  type="number"
                  min={1}
                  max={5}
                  value={doseNumber}
                  onChange={(e) => setDoseNumber(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={t('field_date_administered')}>
                <input
                  className="input"
                  type="date"
                  value={administeredAt}
                  onChange={(e) => setAdministeredAt(e.target.value)}
                />
              </Field>
              <Field label={t('field_batch_number')}>
                <input className="input" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
              </Field>
            </div>

            <Field label={t('field_notes')}>
              <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            {recordError && <p className="text-sm font-medium text-red-600">{recordError}</p>}
            {justRecorded && <p className="text-sm font-medium text-green">{t('vp_vaccination_recorded')}</p>}

            <button type="submit" disabled={recording} className="btn-primary">
              {recording ? t('vp_recording') : t('vp_record_vaccination')}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('vp_growth_history')}
            </p>
            {growthHistory.length === 0 ? (
              <p className="text-sm text-slate-400">{t('vp_no_measurements')}</p>
            ) : (
              <ul className="space-y-1">
                {growthHistory.map((g) => (
                  <li
                    key={g.growthRecordId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-700">
                      {[
                        g.weightKg ? `${g.weightKg} kg` : null,
                        g.heightCm ? `${g.heightCm} cm` : null,
                        g.muacCm ? `MUAC ${g.muacCm} cm` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <span className="text-right text-xs text-slate-500">
                      {g.visitDate}
                      {recorderMeta(g.recordedByName, g.recordedByPhone, g.facilityName, t) && (
                        <span className="block text-slate-400">
                          {recorderMeta(g.recordedByName, g.recordedByPhone, g.facilityName, t)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleRecordGrowth} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('vp_record_growth_measurement')}
            </p>

            <Field label={t('field_visit_date')}>
              <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label={t('field_weight_kg')}>
                <input className="input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </Field>
              <Field label={t('field_height_cm')}>
                <input className="input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </Field>
              <Field label={t('field_muac_cm')}>
                <input className="input" value={muacCm} onChange={(e) => setMuacCm(e.target.value)} />
              </Field>
            </div>

            <Field label={t('field_notes')}>
              <input className="input" value={growthNotes} onChange={(e) => setGrowthNotes(e.target.value)} />
            </Field>

            {growthError && <p className="text-sm font-medium text-red-600">{growthError}</p>}
            {justSavedGrowth && <p className="text-sm font-medium text-green">{t('vp_measurement_recorded')}</p>}

            <button type="submit" disabled={savingGrowth} className="btn-primary">
              {savingGrowth ? t('common_saving') : t('vp_save_measurement')}
            </button>
          </form>
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
