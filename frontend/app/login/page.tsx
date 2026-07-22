'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('nurse.amina');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await login(username, password);
      window.localStorage.setItem('mtotocare_access_token', accessToken);
      router.push('/register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue">MtotoCare Tanzania</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Facility staff sign in</h1>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</span>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-[11px] text-slate-400">Demo seed account: nurse.amina / Nurse@2026</p>
      </form>
    </main>
  );
}
