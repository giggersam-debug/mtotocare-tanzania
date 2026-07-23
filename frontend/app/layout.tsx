import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nav } from '@/components/Nav';
import { LanguageProvider } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'MtotoCare Tanzania',
  description: 'Digital Child Health Passport for Tanzania',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
