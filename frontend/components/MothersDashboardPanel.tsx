'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getMothersList, type MotherSummary } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const today = () => new Date().toISOString().slice(0, 10);

function riskCount(m: MotherSummary): number {
  return [
    m.hivStatus === 'positive',
    m.gestationalDiabetes,
    m.hypertension,
    m.anemia,
    m.malariaInPregnancy,
    m.hasGeneticFamilyHistory,
  ].filter(Boolean).length;
}

export function MothersDashboardPanel({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [mothers, setMothers] = useState<MotherSummary[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pregnant' | 'delivered'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMothersList(accessToken)
      .then(setMothers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the mothers dashboard.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mothers.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (!q) return true;
      return m.guardianFullName.toLowerCase().includes(q) || m.guardianPhone.toLowerCase().includes(q);
    });
  }, [mothers, query, statusFilter]);

  const todayStr = today();

  if (loading) return <p className="text-center text-sm text-slate-400">{t('common_loading')}</p>;
  if (error) return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          className="input max-w-xs"
          placeholder={t('md_search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-1">
          {(['all', 'pregnant', 'delivered'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s ? 'bg-green text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? t('md_filter_all') : s === 'pregnant' ? t('md_filter_pregnant') : t('md_filter_delivered')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {t('md_count')}: {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
          {t('md_empty')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">{t('md_col_mother')}</th>
                <th className="px-4 py-3">{t('md_col_status')}</th>
                <th className="px-4 py-3">{t('reg_gravida')}/{t('reg_para')}</th>
                <th className="px-4 py-3">{t('md_col_last_visit')}</th>
                <th className="px-4 py-3">{t('cp_next_visit_due')}</th>
                <th className="px-4 py-3">{t('md_col_risk')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const overdue = Boolean(m.nextVisitDue && m.nextVisitDue < todayStr);
                const risks = riskCount(m);
                return (
                  <tr key={m.guardianId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-slate-800">{m.guardianFullName}</span>
                      <span className="block text-xs text-slate-400">{m.guardianPhone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          m.status === 'pregnant' ? 'bg-blue/10 text-blue' : 'bg-green/10 text-green'
                        }`}
                      >
                        {m.status === 'pregnant' ? t('md_filter_pregnant') : t('md_filter_delivered')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.gravida ?? '—'}/{m.para ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.lastVisit ?? '—'}</td>
                    <td className="px-4 py-3">
                      {m.nextVisitDue ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            overdue ? 'bg-red-100 text-red-600' : 'bg-blue/10 text-blue'
                          }`}
                        >
                          {m.nextVisitDue}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {risks > 0 ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                          {risks}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/mothers/${m.guardianId}`}
                        className="rounded-lg bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green/90"
                      >
                        {t('hw_open_record')}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
