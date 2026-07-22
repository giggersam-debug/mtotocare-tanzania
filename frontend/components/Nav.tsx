'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/register', label: 'Registration' },
  { href: '/children', label: 'Child Lookup' },
  { href: '/scan', label: 'Vaccinations' },
  { href: '/parent', label: 'Parent Portal' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(window.localStorage.getItem('mtotocare_access_token')));
  }, [pathname]);

  function handleSignOut() {
    window.localStorage.removeItem('mtotocare_access_token');
    router.push('/login');
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
            <span className="block text-[10px] uppercase tracking-wide text-white/70">
              Digital Child Health Record
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-white text-green' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {signedIn && (
            <button
              onClick={handleSignOut}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
            >
              Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
