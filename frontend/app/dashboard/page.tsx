'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardPanel } from '@/components/DashboardPanel';

export default function DashboardPage() {
  const router = useRouter();
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
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Facility overview</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Registrations, vaccination coverage, and nutrition risk.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/register" className="text-sm font-semibold text-blue underline underline-offset-4">
            Register a child →
          </Link>
          <Link href="/scan" className="text-sm font-semibold text-blue underline underline-offset-4">
            Scan &amp; vaccinate →
          </Link>
        </div>
      </div>
      <DashboardPanel accessToken={accessToken} />
    </main>
  );
}
