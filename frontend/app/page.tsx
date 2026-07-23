'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="bg-slate-50">
      <section className="bg-green px-4 py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row">
          <div className="flex-1 text-center lg:text-left">
            <p className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
              {t('home_eyebrow')}
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-bold sm:text-4xl lg:mx-0">{t('home_title')}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 lg:mx-0">{t('home_subtitle')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/register"
                className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-green hover:bg-white/90"
              >
                {t('home_cta_register')}
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t('home_cta_login')}
              </Link>
              <Link
                href="/parent"
                className="rounded-lg border border-white/40 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t('home_cta_parent')}
              </Link>
            </div>
          </div>
          <div className="w-full max-w-sm flex-1 lg:max-w-md">
            <img
              src="https://images.pexels.com/photos/30110240/pexels-photo-30110240/free-photo-of-mother-and-child-in-traditional-african-attire.jpeg?h=900&w=1200&fit=crop"
              alt="A Tanzanian mother holding her child"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-12 sm:grid-cols-4">
        <FeatureBadge label={t('home_badge_qr_label')} desc={t('home_badge_qr_desc')} />
        <FeatureBadge label={t('home_badge_growth_label')} desc={t('home_badge_growth_desc')} />
        <FeatureBadge label={t('home_badge_epi_label')} desc={t('home_badge_epi_desc')} />
        <FeatureBadge label={t('home_badge_live_label')} desc={t('home_badge_live_desc')} />
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
          <img
            src="https://images.pexels.com/photos/38451634/pexels-photo-38451634/free-photo-of-smiling-female-health-officer-outdoors.jpeg?h=600&w=600&fit=crop"
            alt="A smiling community health worker"
            className="h-40 w-40 shrink-0 rounded-xl object-cover"
          />
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold text-navy">{t('home_trust_title')}</p>
            <p className="mt-2 text-sm text-slate-500">{t('home_trust_body')}</p>
          </div>
        </div>
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
