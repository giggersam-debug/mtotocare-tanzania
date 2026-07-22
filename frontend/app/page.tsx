import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-green px-4 py-16 text-center text-white">
        <p className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
          National Digital Health Initiative · Tanzania
        </p>
        <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-bold sm:text-4xl">
          Every child deserves a lifelong health record
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/80">
          Securely accessible from any authorized health facility nationwide — replacing the paper
          RCH booklet with a digital child health passport.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-green hover:bg-white/90"
          >
            Register a Child
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Health Worker Login
          </Link>
          <Link
            href="/parent"
            className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Parent Portal
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-12 sm:grid-cols-4">
        <FeatureBadge label="QR" desc="Scan to open record" />
        <FeatureBadge label="Growth" desc="WHO MUAC screening" />
        <FeatureBadge label="EPI" desc="Vaccination schedule" />
        <FeatureBadge label="Live" desc="Facility dashboard" />
      </section>
    </main>
  );
}

function FeatureBadge({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xl font-bold text-green">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );
}
