'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage, type TranslationKey } from '@/lib/i18n';

function useCurrentUser() {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const raw = window.localStorage.getItem('mtotocare_user');
    if (!raw) {
      setRole(null);
      return;
    }
    try {
      setRole(JSON.parse(raw).role ?? null);
    } catch {
      setRole(null);
    }
  }, [pathname]);

  return role;
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);
  const role = useCurrentUser();

  useEffect(() => {
    setSignedIn(Boolean(window.localStorage.getItem('mtotocare_access_token')));
  }, [pathname]);

  function handleSignOut() {
    window.localStorage.removeItem('mtotocare_access_token');
    window.localStorage.removeItem('mtotocare_user');
    router.push('/login');
  }

  const links: { href: string; key: TranslationKey }[] = [
    { href: '/', key: 'nav_home' },
    { href: '/register', key: 'nav_registration' },
    { href: '/children', key: 'nav_child_lookup' },
    { href: '/scan', key: 'nav_vaccinations' },
    { href: '/parent', key: 'nav_parent_portal' },
    { href: '/health-worker', key: 'nav_health_worker' },
    { href: '/dashboard', key: 'nav_dashboard' },
    { href: '/calendar', key: 'nav_calendar' },
    { href: '/reports', key: 'nav_reports' },
  ];
  if (role === 'administrator') {
    links.push({ href: '/settings', key: 'nav_settings' });
  }

  return (
    <header className="bg-green">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-green">
            M
          </span>
          <span>
            <span className="block text-sm font-bold text-white">MtotoCare Tanzania</span>
            <span className="block text-[10px] uppercase tracking-wide text-white/70">{t('nav_tagline')}</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-white text-green' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
          {signedIn && (
            <button
              onClick={handleSignOut}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
            >
              {t('nav_sign_out')}
            </button>
          )}
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="ml-1 rounded-full border border-white/40 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
            aria-label="Switch language"
          >
            {language === 'en' ? 'SW' : 'EN'}
          </button>
        </nav>
      </div>
    </header>
  );
}
