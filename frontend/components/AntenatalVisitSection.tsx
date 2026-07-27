'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { recordAntenatalVisit, type AntenatalVisit } from '@/lib/api';
import { recorderMeta } from '@/lib/recordMeta';
import { useLanguage } from '@/lib/i18n';

const today = () => new Date().toISOString().slice(0, 10);

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
        <ul className="mt-4 space-y-2">
          {visits.map((v) => (
            <li key={v.antenatalVisitId} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{v.visitDate}</span>
                {v.nextVisitDate && (
                  <span className="text-xs font-semibold text-blue">
                    {t('cp_next_visit_due')}: {v.nextVisitDate}
                  </span>
                )}
              </div>
              {v.notes && <p className="mt-1 text-xs text-slate-500">{v.notes}</p>}
              {recorderMeta(v.recordedByName, null, null, v.facilityName, t) && (
                <p className="mt-1 text-xs text-slate-400">
                  {recorderMeta(v.recordedByName, null, null, v.facilityName, t)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
        <Field label={t('cp_next_visit_due')}>
          <input
            className="input"
            type="date"
            value={nextVisitDate}
            onChange={(e) => setNextVisitDate(e.target.value)}
          />
        </Field>
      </div>
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
