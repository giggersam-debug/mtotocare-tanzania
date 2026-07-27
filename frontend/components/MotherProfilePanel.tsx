'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMaternalHealthForGuardian, type MaternalHealthRecord } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { maternalRiskFlags } from '@/lib/maternalRisk';
import { recorderMeta } from '@/lib/recordMeta';
import { AntenatalVisitSection } from './AntenatalVisitSection';

export function MotherProfilePanel({ guardianId, accessToken }: { guardianId: string; accessToken: string }) {
  const { t } = useLanguage();
  const [record, setRecord] = useState<MaternalHealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    return getMaternalHealthForGuardian(guardianId, accessToken).then(setRecord);
  }

  useEffect(() => {
    reload()
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this mother.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianId, accessToken]);

  if (loading) return <p className="text-center text-sm text-slate-400">{t('common_loading')}</p>;
  if (error) return <p className="mx-auto max-w-lg text-center text-sm font-medium text-red-600">{error}</p>;
  if (!record) return <p className="mx-auto max-w-lg text-center text-sm text-slate-400">{t('mp_not_found')}</p>;

  const flags = maternalRiskFlags(record);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{t('mp_eyebrow')}</p>
            <h2 className="text-xl font-bold text-slate-900">{record.guardianFullName}</h2>
            <p className="text-sm text-slate-500">
              {record.guardianPhone}
              {record.guardianRelation ? ` · ${record.guardianRelation}` : ''}
            </p>
            {(record.guardianOccupation || record.guardianResidence) && (
              <p className="mt-0.5 text-xs text-slate-400">
                {[record.guardianOccupation, record.guardianResidence].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
              record.childId ? 'bg-green/10 text-green' : 'bg-blue/10 text-blue'
            }`}
          >
            {record.childId ? t('md_filter_delivered') : t('md_filter_pregnant')}
          </span>
        </div>

        {record.childId && (
          <Link
            href={`/children/${record.childId}`}
            className="mt-3 inline-block text-xs font-semibold text-blue underline underline-offset-4"
          >
            {t('mp_view_child')}: {record.childFullName}
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-slate-900">{t('cp_maternal_title')}</h3>

        {flags.length > 0 && (
          <div className="mb-4 rounded-xl bg-red-50 p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-red-600">
              {t('cp_maternal_risk_flags')}
            </p>
            <ul className="space-y-0.5 text-sm text-red-700">
              {flags.map((flag) => (
                <li key={flag}>{t(flag)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          {record.gravida != null && <MeasureCard label={t('reg_gravida')} value={String(record.gravida)} />}
          {record.para != null && <MeasureCard label={t('reg_para')} value={String(record.para)} />}
          {record.estimatedDueDate && <MeasureCard label={t('reg_edd')} value={record.estimatedDueDate} />}
          {record.gestationalAgeWeeks != null && (
            <MeasureCard label={t('reg_gestational_age')} value={`${record.gestationalAgeWeeks} wk`} />
          )}
          <MeasureCard
            label={t('reg_hiv_status')}
            value={
              record.hivStatus === 'positive'
                ? t('reg_hiv_positive')
                : record.hivStatus === 'negative'
                  ? t('reg_hiv_negative')
                  : t('reg_hiv_unknown')
            }
          />
        </div>

        {record.nextVisitDue && (
          <div className="mt-4 rounded-xl bg-blue/10 px-3 py-2 text-sm font-semibold text-blue">
            {t('cp_next_visit_due')}: {record.nextVisitDue}
          </div>
        )}

        {record.geneticFamilyHistory && (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">{t('reg_genetic_family_history')}: </span>
            {record.geneticFamilyHistory}
          </p>
        )}

        {record.clinicalNotes && (
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">{t('cp_clinical_notes')}: </span>
            {record.clinicalNotes}
          </p>
        )}

        {(record.recordedByName || record.facilityName) && (
          <p className="mt-3 text-xs text-slate-400">
            {recorderMeta(record.recordedByName, null, null, record.facilityName, t)}
          </p>
        )}
      </div>

      <AntenatalVisitSection
        maternalHealthRecordId={record.maternalHealthRecordId}
        accessToken={accessToken}
        visits={record.visits ?? []}
        onChanged={reload}
      />
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
