'use client';

import { useEffect, useState } from 'react';
import { getCalendar, type CalendarDay } from '@/lib/api';

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.toISOString().slice(0, 7);
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const STATUS_STYLE: Record<string, string> = {
  overdue: 'bg-red-100 text-red-600',
  due: 'bg-amber-100 text-amber-700',
};

export function CalendarPanel({ accessToken }: { accessToken: string }) {
  const [month, setMonth] = useState(currentMonth());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCalendar(accessToken, month)
      .then((res) => setDays(res.days))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the calendar.'))
      .finally(() => setLoading(false));
  }, [accessToken, month]);

  const totalItems = days.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Prev
        </button>
        <p className="text-sm font-bold text-slate-900">{formatMonthLabel(month)}</p>
        <button
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>

      {loading && <p className="text-center text-sm text-slate-400">Loading…</p>}
      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-center text-xs text-slate-400">
            {totalItems} due/overdue visit{totalItems === 1 ? '' : 's'} this month
          </p>

          {days.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
              No due or overdue visits found for this month.
            </p>
          ) : (
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.date} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{day.date}</p>
                  <ul className="space-y-1.5">
                    {day.items.map((item, i) => (
                      <li
                        key={`${item.childId}-${item.vaccineCode}-${i}`}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="font-semibold text-slate-700">
                          {item.fullName}{' '}
                          <span className="font-normal text-slate-500">· {item.vaccineLabel}</span>
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[item.status] ?? 'bg-slate-100 text-slate-500'}`}
                        >
                          {item.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
