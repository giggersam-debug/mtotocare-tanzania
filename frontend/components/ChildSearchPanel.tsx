'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { searchChildren, type ChildSearchResult } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export function ChildSearchPanel({ accessToken }: { accessToken: string }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChildSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const found = await searchChildren(query.trim(), accessToken);
      setResults(found);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          className="input"
          placeholder={t('cs_search_placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading || !query.trim()} className="btn-primary w-auto px-6">
          {loading ? t('cs_searching') : t('cs_search')}
        </button>
      </form>

      {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

      {searched && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {results.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">{t('cs_no_match')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">{t('cs_col_child')}</th>
                  <th className="px-4 py-3">{t('cs_col_id')}</th>
                  <th className="px-4 py-3">{t('cs_col_dob')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {results.map((child) => (
                  <tr key={child.childId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-800">{child.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {child.childId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{child.dateOfBirth}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/children/${child.childId}`}
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
