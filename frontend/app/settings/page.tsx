'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useLanguage } from '@/lib/i18n';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('mtotocare_access_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const raw = window.localStorage.getItem('mtotocare_user');
    const role = raw ? JSON.parse(raw).role : null;
    if (role !== 'administrator') {
      router.replace('/dashboard');
      return;
    }
    setAllowed(true);
    setAccessToken(token);
  }, [router]);

  if (!allowed || !accessToken) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Administration</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('settings_title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('settings_subtitle')}</p>
      </div>
      <SettingsPanel accessToken={accessToken} />
    </main>
  );
}
