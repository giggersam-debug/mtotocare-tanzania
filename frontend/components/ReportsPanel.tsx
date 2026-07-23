'use client';

import { useEffect, useState } from 'react';
import { getDashboardReport, type DashboardReport } from '@/lib/api';

function toCsv(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? '' : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))];
  return lines.join('\n');
}

function downloadCsv(filename: string, rows: any[]) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ReportsPanel({ accessToken }: { accessToken: string }) {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardReport(accessToken)
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the report.'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return <p className="text-center text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;
  if (!report) return null;

  const dateStamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {report.facilityName && <p className="text-center text-sm text-slate-500">{report.facilityName}</p>}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Children" value={report.children.length} />
        <StatCard label="Vaccination records" value={report.vaccinations.length} />
        <StatCard label="Growth records" value={report.growth.length} />
      </div>

      <ReportCard
        title="Children registry"
        description="Full list of children registered at your facility."
        count={report.children.length}
        onExport={() => downloadCsv(`mtotocare-children-${dateStamp}.csv`, report.children)}
      />
      <ReportCard
        title="Vaccination records"
        description="Every vaccination dose recorded at your facility, with who administered it."
        count={report.vaccinations.length}
        onExport={() => downloadCsv(`mtotocare-vaccinations-${dateStamp}.csv`, report.vaccinations)}
      />
      <ReportCard
        title="Growth & nutrition records"
        description="Weight, height, and MUAC screening history for your facility."
        count={report.growth.length}
        onExport={() => downloadCsv(`mtotocare-growth-${dateStamp}.csv`, report.growth)}
      />
    </div>
  );
}

function ReportCard({
  title,
  description,
  count,
  onExport,
}: {
  title: string;
  description: string;
  count: number;
  onExport: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={onExport}
        disabled={count === 0}
        className="shrink-0 rounded-lg bg-green px-4 py-2 text-xs font-semibold text-white hover:bg-green/90 disabled:opacity-40"
      >
        Export CSV
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
