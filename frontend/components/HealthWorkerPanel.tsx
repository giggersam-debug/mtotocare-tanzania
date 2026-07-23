'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPatientList, runRemindersNow, type PatientListEntry } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

function ageLabel(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth).getTime();
  const days = Math.floor((Date.now() - dob) / (24 * 60 * 60 * 1000));
  if (days < 60) return `${days} d`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} mo`;
  return `${Math.floor(months / 12)} yr`;
}

const FLAG_STYLE: Record<string, string> = {
  'Overdue visit': 'bg-red-100 text-red-600',
  'Malnutrition risk': 'bg-amber-100 text-amber-700',
};

export function HealthWorkerPanel({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [patients, setPatients] = useState<PatientListEntry[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const FLAG_LABEL: Record<string, string> = {
    'Overdue visit': t('hw_flag_overdue'),
    'Malnutrition risk': t('hw_flag_malnutrition'),
  };

  useEffect(() => {
    getPatientList(accessToken)
      .then(setPatients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the patient list.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleSendReminders() {
    setSending(true);
    setReminderStatus(null);
    try {
      const result = await runRemindersNow(accessToken);
      setReminderStatus(
        `Sent ${result.sent} reminder${result.sent === 1 ? '' : 's'}` +
          (result.failed ? `, ${result.failed} failed` : '') +
          '.',
      );
    } catch (err) {
      setReminderStatus(err instanceof Error ? err.message : 'Could not send reminders.');
    } finally {
      setSending(false);
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.trim().toLowerCase();
    return patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.childId.slice(0, 8).toLowerCase().includes(q),
    );
  }, [patients, query]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          className="input flex-1"
          placeholder={t('hw_filter_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link href="/scan" className="btn-primary w-auto whitespace-nowrap px-6">
          {t('hw_scan_qr')}
        </Link>
        <button
          type="button"
          onClick={handleSendReminders}
          disabled={sending}
          className="btn-secondary w-auto whitespace-nowrap px-6 disabled:opacity-50"
        >
          {sending ? t('hw_sending') : t('hw_send_reminders')}
        </button>
      </div>

      {reminderStatus && <p className="text-center text-sm font-medium text-slate-600">{reminderStatus}</p>}

      {loading && <p className="text-center text-sm text-slate-400">{t('common_loading')}</p>}
      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">{t('hw_no_patients')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">{t('hw_col_child')}</th>
                  <th className="px-4 py-3">{t('hw_col_id')}</th>
                  <th className="px-4 py-3">{t('hw_col_age')}</th>
                  <th className="px-4 py-3">{t('hw_col_last_visit')}</th>
                  <th className="px-4 py-3">{t('hw_col_flags')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.childId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {p.childId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{ageLabel(p.dateOfBirth)}</td>
                    <td className="px-4 py-3 text-slate-500">{p.lastVisit ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.flags.length === 0 ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          p.flags.map((f) => (
                            <span
                              key={f}
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${FLAG_STYLE[f] ?? 'bg-slate-100 text-slate-500'}`}
                            >
                              {FLAG_LABEL[f] ?? f}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/children/${p.childId}`}
                        className="rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green/90"
                      >
                        {t('hw_open_record')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
