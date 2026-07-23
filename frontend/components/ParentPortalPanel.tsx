'use client';

import { useState, type FormEvent } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { parentLookup, type ParentLookupResponse, type ScheduleEntry } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

const STATUS_STYLE: Record<ScheduleEntry['status'], string> = {
  completed: 'bg-green/10 text-green',
  due: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600',
  not_yet_due: 'bg-slate-100 text-slate-500',
};

function downloadHealthCertificate(result: ParentLookupResponse) {
  const win = window.open('', '_blank');
  if (!win) return;

  const completed = result.schedule.filter((s) => s.status === 'completed');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Health Certificate — ${result.child.fullName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #2E7D32; margin-bottom: 4px; }
          .sub { color: #64748b; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          th { color: #64748b; text-transform: uppercase; font-size: 11px; }
          .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h1>MtotoCare Tanzania</h1>
        <p class="sub">Digital Child Health Certificate</p>
        <p><strong>${result.child.fullName}</strong></p>
        <p>${result.child.sex === 'female' ? 'Female' : 'Male'} · Born ${result.child.dateOfBirth}</p>
        <p>Health ID: ${result.child.childId.slice(0, 8).toUpperCase()}</p>

        <h3>Completed vaccinations</h3>
        <table>
          <thead><tr><th>Vaccine</th><th>Date</th></tr></thead>
          <tbody>
            ${completed
              .map((s) => `<tr><td>${s.label}</td><td>${s.dueDate}</td></tr>`)
              .join('')}
          </tbody>
        </table>

        <p class="footer">Generated ${new Date().toISOString().slice(0, 10)} · MtotoCare Tanzania Digital Child Health Record</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

export function ParentPortalPanel() {
  const { t } = useLanguage();
  const STATUS_LABEL: Record<ScheduleEntry['status'], string> = {
    completed: t('pp_status_completed'),
    due: t('pp_status_due'),
    overdue: t('pp_status_overdue'),
    not_yet_due: t('pp_status_not_yet_due'),
  };
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
  const chartData =
    result?.growth.filter((g) => g.weightKg !== undefined).map((g) => ({ date: g.visitDate, weight: g.weightKg })) ?? [];

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{t('pp_find_title')}</h2>
        <p className="text-xs text-slate-500">{t('pp_find_desc')}</p>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('pp_qr_token')}
          </span>
          <input
            className="input font-mono text-xs"
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder={t('pp_qr_placeholder')}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('pp_phone')}
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
          {loading ? t('pp_looking_up') : t('pp_view_record')}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">{t('pp_welcome_back')}</p>
          <h2 className="text-lg font-bold text-slate-900">{result.child.fullName}</h2>
          <p className="text-sm text-slate-500">
            {result.child.sex === 'female' ? 'Female' : 'Male'} · Born {result.child.dateOfBirth}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => downloadHealthCertificate(result)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {t('pp_download_cert')}
            </button>
            <span
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                result.child.whatsappOptIn ? 'bg-green/10 text-green' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {result.child.whatsappOptIn ? t('pp_whatsapp_on') : t('pp_whatsapp_off')}
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('pp_upcoming')}</p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400">{t('pp_up_to_date')}</p>
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

          {chartData.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('pp_growth_chart')}
              </p>
              {chartData.length === 1 ? (
                <p className="text-sm text-slate-400">
                  {t('pp_one_measurement')} ({chartData[0].weight} kg on {chartData[0].date}).
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="kg" width={35} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('pp_vaccination_history')}
            </p>
            {result.vaccinations.length === 0 ? (
              <p className="text-sm text-slate-400">{t('pp_no_vaccinations')}</p>
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
