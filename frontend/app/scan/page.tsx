'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VaccinationPanel } from '@/components/VaccinationPanel';

export default function ScanPage() {
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
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Facility visit</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Scan &amp; vaccinate</h1>
        <p className="mt-1 text-sm text-slate-500">
          Look up a child by their QR passport and record a vaccination against their record.
        </p>
        <Link
          href="/register"
          className="mt-3 inline-block text-sm font-semibold text-blue underline underline-offset-4"
        >
          Go to Register a child →
        </Link>
      </div>
      <VaccinationPanel accessToken={accessToken} />
    </main>
  );
}
