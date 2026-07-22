'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RegisterChildForm } from '@/components/RegisterChildForm';

export default function RegisterPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Real session token, set by /login — replaces the old hardcoded
    // 'SESSION_ACCESS_TOKEN' placeholder now that the Auth module exists.
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
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">New registration</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Register a child</h1>
        <p className="mt-1 text-sm text-slate-500">Issues a Child ID and QR passport immediately.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/scan" className="text-sm font-semibold text-blue underline underline-offset-4">
            Go to Scan &amp; vaccinate →
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-blue underline underline-offset-4">
            Go to Dashboard →
          </Link>
        </div>
      </div>
      <RegisterChildForm accessToken={accessToken} />
    </main>
  );
}
