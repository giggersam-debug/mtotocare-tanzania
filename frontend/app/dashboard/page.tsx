'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardPanel } from '@/components/DashboardPanel';
import { useLanguage } from '@/lib/i18n';

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('mtotocare_access_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setAccessToken(token);
  }, [router]);

  if (!accessToken) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">{t('dash_eyebrow')}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('nav_dashboard')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('dash_subtitle')}</p>
      </div>
      <DashboardPanel accessToken={accessToken} />
    </main>
  );
}
