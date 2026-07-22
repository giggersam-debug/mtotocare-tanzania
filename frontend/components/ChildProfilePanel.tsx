'use client';

import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getChildProfile,
  getChildSchedule,
  getGrowthHistory,
  getVaccinationHistory,
  type ChildProfile,
  type GrowthRecord,
  type ScheduleEntry,
  type VaccinationRecord,
} from '@/lib/api';

const NUTRITIONAL_STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  moderate_acute_malnutrition: 'Moderate acute malnutrition',
  severe_acute_malnutrition: 'Severe acute malnutrition',
};

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

export function ChildProfilePanel({ childId, accessToken }: { childId: string; accessToken: string }) {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [growth, setGrowth] = useState<GrowthRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getChildProfile(childId, accessToken),
      getVaccinationHistory(childId, accessToken),
      getGrowthHistory(childId, accessToken),
      getChildSchedule(childId, accessToken),
    ])
      .then(([p, v, g, s]) => {
        setProfile(p);
        setVaccinations(v);
        setGrowth(g);
        setSchedule(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this child.'))
      .finally(() => setLoading(false));
  }, [childId, accessToken]);

  if (loading) return <p className="text-center text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;
  if (!profile) return null;

  const latestGrowth = growth[growth.length - 1];
  const chartData = growth.filter((g) => g.weightKg !== undefined).map((g) => ({ date: g.visitDate, weight: g.weightKg }));

  const visits = [
    ...vaccinations.map((v) => ({ date: v.administeredAt, label: `${v.vaccineCode}${v.doseNumber ? ` · dose ${v.doseNumber}` : ''}` })),
    ...growth.map((g) => ({ date: g.visitDate, label: 'Growth monitoring' })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              ID {profile.childId.slice(0, 8).toUpperCase()}
            </p>
            <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
            <p className="text-sm text-slate-500">
              {profile.sex === 'female' ? 'Female' : 'Male'} · Born {profile.dateOfBirth}
              {profile.region ? ` · ${profile.region}${profile.district ? `, ${profile.district}` : ''}` : ''}
            </p>
            {profile.guardian && (
              <p className="mt-1 text-xs text-slate-400">
                Guardian: {profile.guardian.fullName} ({profile.guardian.relation}) · {profile.guardian.phone}
              </p>
            )}
          </div>
          {latestGrowth?.nutritionalStatus && (
            <span
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                latestGrowth.nutritionalStatus === 'normal' ? 'bg-green/10 text-green' : 'bg-red-50 text-red-600'
              }`}
            >
              Nutrition: {NUTRITIONAL_STATUS_LABEL[latestGrowth.nutritionalStatus]}
            </span>
          )}
        </div>

        {latestGrowth && (
          <div className="mt-5 grid grid-cols-3 gap-4">
            <MeasureCard label="Weight" value={latestGrowth.weightKg ? `${latestGrowth.weightKg} kg` : '—'} />
            <MeasureCard label="Height" value={latestGrowth.heightCm ? `${latestGrowth.heightCm} cm` : '—'} />
            <MeasureCard label="MUAC" value={latestGrowth.muacCm ? `${latestGrowth.muacCm} cm` : '—'} />
          </div>
        )}
      </div>

      {chartData.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Growth chart — weight over time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="kg" width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Vaccination tracker</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2">Vaccine</th>
              <th className="py-2">Scheduled</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s) => (
              <tr key={s.code} className="border-b border-slate-50 last:border-0">
                <td className="py-2 font-medium text-slate-700">{s.label}</td>
                <td className="py-2 text-slate-500">{s.dueDate}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Recent visits</h3>
        {visits.length === 0 ? (
          <p className="text-sm text-slate-400">No visits recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {visits.map((v, i) => (
              <li key={i} className="flex items-center justify-between border-l-2 border-green pl-3 text-sm">
                <span className="font-semibold text-slate-700">{v.label}</span>
                <span className="text-slate-500">{v.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MeasureCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
