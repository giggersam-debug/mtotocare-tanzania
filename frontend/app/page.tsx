import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue">MtotoCare Tanzania</p>
      <h1 className="text-3xl font-bold text-slate-900">Digital Child Health Passport</h1>
      <p className="max-w-md text-sm text-slate-500">
        Sign in as facility staff to register a child and issue their QR health passport.
      </p>
      <Link href="/login" className="btn-primary inline-block w-auto px-6">
        Staff sign in
      </Link>
    </main>
  );
}
