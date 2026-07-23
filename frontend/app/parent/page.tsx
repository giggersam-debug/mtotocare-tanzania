'use client';

import { ParentPortalPanel } from '@/components/ParentPortalPanel';
import { useLanguage } from '@/lib/i18n';

export default function ParentPortalPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">{t('nav_parent_portal')}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('parent_title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('parent_subtitle')}</p>
      </div>
      <ParentPortalPanel />
    </main>
  );
}
