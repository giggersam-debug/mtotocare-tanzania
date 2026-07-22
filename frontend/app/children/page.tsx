'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChildSearchPanel } from '@/components/ChildSearchPanel';

export default function ChildrenSearchPage() {
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
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Child Lookup</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Find a child's record</h1>
        <p className="mt-1 text-sm text-slate-500">Search by name or health ID.</p>
      </div>
      <ChildSearchPanel accessToken={accessToken} />
    </main>
  );
}
