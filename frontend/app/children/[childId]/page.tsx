'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChildProfilePanel } from '@/components/ChildProfilePanel';

export default function ChildProfilePage() {
  const router = useRouter();
  const params = useParams<{ childId: string }>();
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
        <p className="text-xs font-semibold uppercase tracking-widest text-blue">Child Profile</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Full record</h1>
      </div>
      <ChildProfilePanel childId={params.childId} accessToken={accessToken} />
    </main>
  );
}
