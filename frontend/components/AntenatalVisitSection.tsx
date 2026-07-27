'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { recordAntenatalVisit, type AntenatalVisit, type UrineTestResult } from '@/lib/api';
import { recorderMeta } from '@/lib/recordMeta';
import { useLanguage, type TranslationKey } from '@/lib/i18n';

const today = () => new Date().toISOString().slice(0, 10);

const URINE_LABEL: Record<UrineTestResult, TranslationKey> = {
  negative: 'field_urine_negative',
  trace: 'field_urine_trace',
  positive: 'field_urine_positive',
};

// Shared between the child profile (visits tied to a born child) and the
// mother profile (visits tied to a mother who may not have delivered yet) —
// both key off the same maternalHealthRecordId either way.
export function AntenatalVisitSection({
  maternalHealthRecordId,
  accessToken,
  visits,
  onChanged,
}: {
  maternalHealthRecordId: string;
  accessToken: string;
  visits: AntenatalVisit[];
  onChanged: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">{t('cp_anc_visit_history')}</h3>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {showAdd ? t('common_cancel') : t('cp_record_visit_btn')}
        </button>
      </div>

      {showAdd && (
        <AddAntenatalVisitForm
          maternalHealthRecordId={maternalHealthRecordId}
          accessToken={accessToken}
          onDone={async () => {
            setShowAdd(false);
            await onChanged();
          }}
        />
      )}

      {visits.length === 0 ? (
        <p className="text-sm text-slate-400">{t('cp_no_anc_visits')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visits.map((v) => (
            <VisitCard key={v.antenatalVisitId} visit={v} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VisitCard({ visit: v }: { visit: AntenatalVisit }) {
  const { t } = useLanguage();

  const vitals: { label: string; value: string }[] = [];
  if (v.gestationalAgeWeeks != null) vitals.push({ label: t('field_gestational_age'), value: `${v.gestationalAgeWeeks} wk` });
  if (v.weightKg != null) vitals.push({ label: t('field_weight_kg'), value: `${v.weightKg} kg` });
  if (v.bpSystolic != null && v.bpDiastolic != null) {
    vitals.push({ label: t('field_blood_pressure'), value: `${v.bpSystolic}/${v.bpDiastolic}` });
  }
  if (v.fundalHeightCm != null) vitals.push({ label: t('field_fundal_height'), value: `${v.fundalHeightCm} cm` });
  if (v.fetalHeartbeatPresent != null) {
    vitals.push({
      label: t('field_fetal_heartbeat'),
      value: v.fetalHeartbeatPresent ? t('field_fhr_present') : t('field_fhr_absent'),
    });
  }
  if (v.hemoglobinGdl != null) vitals.push({ label: t('field_hemoglobin'), value: `${v.hemoglobinGdl} g/dL` });
  if (v.urineProtein) vitals.push({ label: t('field_urine_protein'), value: t(URINE_LABEL[v.urineProtein]) });
  if (v.urineGlucose) vitals.push({ label: t('field_urine_glucose'), value: t(URINE_LABEL[v.urineGlucose]) });

  const treatments: string[] = [];
  if (v.ironFolicAcidGiven) treatments.push(t('field_iron_folic_acid'));
  if (v.iptpSpDoseGiven != null) treatments.push(`${t('field_iptp_dose')} ${v.iptpSpDoseGiven}`);
  if (v.dewormingGiven) treatments.push(t('field_deworming'));

  return (
    <li className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-700">{v.visitDate}</span>
        {v.nextVisitDate && (
          <span className="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue">
            {t('cp_next_visit_due')}: {v.nextVisitDate}
          </span>
        )}
      </div>

      {vitals.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {vitals.map((item) => (
            <span key={item.label}>
              <span className="text-slate-400">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>
      )}

      {treatments.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {treatments.map((label) => (
            <span key={label} className="rounded-full bg-green/10 px-2 py-0.5 text-xs font-semibold text-green">
              {label}
            </span>
          ))}
        </div>
      )}

      {v.dangerSigns && (
        <p className="mt-1.5 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
          {t('field_danger_signs')}: {v.dangerSigns}
        </p>
      )}

      {v.investigationsOrdered && (
        <p className="mt-1.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">{t('field_investigations_ordered')}: </span>
          {v.investigationsOrdered}
        </p>
      )}

      {v.notes && <p className="mt-1.5 text-xs text-slate-500">{v.notes}</p>}

      {recorderMeta(v.recordedByName, null, null, v.facilityName, t) && (
        <p className="mt-1.5 text-xs text-slate-400">
          {recorderMeta(v.recordedByName, null, null, v.facilityName, t)}
        </p>
      )}
    </li>
  );
}

function AddAntenatalVisitForm({
  maternalHealthRecordId,
  accessToken,
  onDone,
}: {
  maternalHealthRecordId: string;
  accessToken: string;
  onDone: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [visitDate, setVisitDate] = useState(today());
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [fundalHeightCm, setFundalHeightCm] = useState('');
  const [fetalHeartbeat, setFetalHeartbeat] = useState<'' | 'present' | 'absent'>('');
  const [dangerSigns, setDangerSigns] = useState('');
  const [urineProtein, setUrineProtein] = useState<'' | UrineTestResult>('');
  const [urineGlucose, setUrineGlucose] = useState<'' | UrineTestResult>('');
  const [hemoglobinGdl, setHemoglobinGdl] = useState('');
  const [ironFolicAcidGiven, setIronFolicAcidGiven] = useState(false);
  const [iptpSpDoseGiven, setIptpSpDoseGiven] = useState('');
  const [dewormingGiven, setDewormingGiven] = useState(false);
  const [investigationsOrdered, setInvestigationsOrdered] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await recordAntenatalVisit(
        maternalHealthRecordId,
        {
          visitDate,
          gestationalAgeWeeks: gestationalAgeWeeks ? Number(gestationalAgeWeeks) : undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
          bpSystolic: bpSystolic ? Number(bpSystolic) : undefined,
          bpDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
          fundalHeightCm: fundalHeightCm ? Number(fundalHeightCm) : undefined,
          fetalHeartbeatPresent: fetalHeartbeat ? fetalHeartbeat === 'present' : undefined,
          dangerSigns: dangerSigns || undefined,
          urineProtein: urineProtein || undefined,
          urineGlucose: urineGlucose || undefined,
          hemoglobinGdl: hemoglobinGdl ? Number(hemoglobinGdl) : undefined,
          ironFolicAcidGiven,
          iptpSpDoseGiven: iptpSpDoseGiven ? Number(iptpSpDoseGiven) : undefined,
          dewormingGiven,
          investigationsOrdered: investigationsOrdered || undefined,
          nextVisitDate: nextVisitDate || undefined,
          notes: notes || undefined,
        },
        accessToken,
      );
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record the visit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-xl bg-slate-50 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('field_visit_date')}>
          <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
        </Field>
        <Field label={t('field_gestational_age')}>
          <input
            className="input"
            type="number"
            value={gestationalAgeWeeks}
            onChange={(e) => setGestationalAgeWeeks(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label={t('field_weight_kg')}>
          <input className="input" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </Field>
        <Field label={t('field_blood_pressure')}>
          <div className="flex items-center gap-1">
            <input
              className="input"
              type="number"
              placeholder="120"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
            />
            <span className="text-slate-400">/</span>
            <input
              className="input"
              type="number"
              placeholder="80"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
            />
          </div>
        </Field>
        <Field label={t('field_fundal_height')}>
          <input
            className="input"
            type="number"
            value={fundalHeightCm}
            onChange={(e) => setFundalHeightCm(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label={t('field_fetal_heartbeat')}>
          <select
            className="input"
            value={fetalHeartbeat}
            onChange={(e) => setFetalHeartbeat(e.target.value as typeof fetalHeartbeat)}
          >
            <option value="">{t('field_fhr_not_assessed')}</option>
            <option value="present">{t('field_fhr_present')}</option>
            <option value="absent">{t('field_fhr_absent')}</option>
          </select>
        </Field>
        <Field label={t('field_urine_protein')}>
          <select
            className="input"
            value={urineProtein}
            onChange={(e) => setUrineProtein(e.target.value as typeof urineProtein)}
          >
            <option value="">—</option>
            <option value="negative">{t('field_urine_negative')}</option>
            <option value="trace">{t('field_urine_trace')}</option>
            <option value="positive">{t('field_urine_positive')}</option>
          </select>
        </Field>
        <Field label={t('field_urine_glucose')}>
          <select
            className="input"
            value={urineGlucose}
            onChange={(e) => setUrineGlucose(e.target.value as typeof urineGlucose)}
          >
            <option value="">—</option>
            <option value="negative">{t('field_urine_negative')}</option>
            <option value="trace">{t('field_urine_trace')}</option>
            <option value="positive">{t('field_urine_positive')}</option>
          </select>
        </Field>
      </div>

      <Field label={t('field_danger_signs')}>
        <input className="input" value={dangerSigns} onChange={(e) => setDangerSigns(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('field_hemoglobin')}>
          <input
            className="input"
            type="number"
            value={hemoglobinGdl}
            onChange={(e) => setHemoglobinGdl(e.target.value)}
          />
        </Field>
        <Field label={t('field_iptp_dose')}>
          <input
            className="input"
            type="number"
            min={1}
            max={6}
            value={iptpSpDoseGiven}
            onChange={(e) => setIptpSpDoseGiven(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={ironFolicAcidGiven}
            onChange={(e) => setIronFolicAcidGiven(e.target.checked)}
          />
          {t('field_iron_folic_acid')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={dewormingGiven} onChange={(e) => setDewormingGiven(e.target.checked)} />
          {t('field_deworming')}
        </label>
      </div>

      <Field label={t('field_investigations_ordered')}>
        <input
          className="input"
          value={investigationsOrdered}
          onChange={(e) => setInvestigationsOrdered(e.target.value)}
        />
      </Field>

      <Field label={t('cp_next_visit_due')}>
        <input className="input" type="date" value={nextVisitDate} onChange={(e) => setNextVisitDate(e.target.value)} />
      </Field>

      <Field label={t('field_notes')}>
        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? t('common_saving') : t('cp_save_visit')}
      </button>
    </form>
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
