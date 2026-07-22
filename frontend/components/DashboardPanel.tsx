'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardSummary, type DashboardSummary } from '@/lib/api';

export function DashboardPanel({ accessToken }: { accessToken: string }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary(accessToken)
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <p className="text-center text-sm text-slate-400">Loading…</p>;

  if (error) {
    return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;
  }

  if (!summary) return null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {summary.facilityName && (
        <p className="text-center text-sm text-slate-500">{summary.facilityName}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Children registered" value={summary.childrenRegistered} />
        <StatCard label="Vaccinations given" value={summary.vaccinationsGiven} />
        <StatCard
          label="Malnutrition risk"
          value={summary.malnutritionRiskCount}
          tone={summary.malnutritionRiskCount > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Vaccinations by type</h2>
        {summary.vaccinationsByVaccine.length === 0 ? (
          <p className="text-sm text-slate-400">No vaccinations recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, summary.vaccinationsByVaccine.length * 28)}>
            <BarChart
              data={[...summary.vaccinationsByVaccine].sort((a, b) => b.count - a.count)}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="vaccineCode" width={110} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2E7D32" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-900">Overdue vaccinations</h2>
        {summary.overdueVaccinations.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing overdue right now.</p>
        ) : (
          <ul className="space-y-1">
            {summary.overdueVaccinations.map((o, i) => (
              <li
                key={`${o.childId}-${o.vaccineCode}-${i}`}
                className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-slate-700">
                  {o.fullName} <span className="font-normal text-slate-500">· {o.vaccineCode}</span>
                </span>
                <span className="text-red-600">due since {o.dueSince}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className={`text-3xl font-bold ${tone === 'warning' && value > 0 ? 'text-red-600' : 'text-slate-900'}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
