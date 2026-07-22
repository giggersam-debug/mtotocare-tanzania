'use client';

import { useState, type FormEvent } from 'react';
import { parentLookup, type ParentLookupResponse, type ScheduleEntry } from '@/lib/api';

const STATUS_STYLE: Record<ScheduleEntry['status'], string> = {
  completed: 'bg-green/10 text-green',
  due: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600',
  not_yet_due: 'bg-slate-100 text-slate-500',
};

const STATUS_LABEL: Record<ScheduleEntry['status'], string> = {
  completed: 'Completed',
  due: 'Due',
  overdue: 'Overdue',
  not_yet_due: 'Not yet due',
};

export function ParentPortalPanel() {
  const [qrToken, setQrToken] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<ParentLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await parentLookup(qrToken.trim(), phone.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not find a matching record.');
    } finally {
      setLoading(false);
    }
  }

  const upcoming = result?.schedule.filter((s) => s.status === 'due' || s.status === 'overdue') ?? [];

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Find your child's record</h2>
        <p className="text-xs text-slate-500">
          Enter the QR token from your child's passport card and the phone number used at registration.
        </p>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">QR token</span>
          <input
            className="input font-mono text-xs"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder="Paste or scan the token from the passport card"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Phone number
          </span>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+255 7xx xxx xxx"
          />
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={loading || !qrToken.trim() || !phone.trim()} className="btn-primary">
          {loading ? 'Looking up…' : 'View my child’s record'}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Welcome back</p>
          <h2 className="text-lg font-bold text-slate-900">{result.child.fullName}</h2>
          <p className="text-sm text-slate-500">
            {result.child.sex === 'female' ? 'Female' : 'Male'} · Born {result.child.dateOfBirth}
          </p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming appointments
            </p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing due right now — fully up to date.</p>
            ) : (
              <ul className="space-y-1">
                {upcoming.map((s) => (
                  <li
                    key={s.code}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      s.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-700">{s.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]} · {s.dueDate}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vaccination history
            </p>
            {result.vaccinations.length === 0 ? (
              <p className="text-sm text-slate-400">No vaccinations recorded yet.</p>
            ) : (
              <ul className="space-y-1">
                {result.vaccinations.map((v) => (
                  <li
                    key={v.vaccinationId}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-700">{v.vaccineCode}</span>
                    <span className="text-slate-500">{v.administeredAt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
