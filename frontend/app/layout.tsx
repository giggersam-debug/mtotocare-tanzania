import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Nav } from '@/components/Nav';
import { LanguageProvider } from '@/lib/i18n';
import { PwaRegister } from '@/components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'MtotoCare Tanzania',
  description: 'Digital Child Health Passport for Tanzania',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MtotoCare',
  },
};

export const viewport: Viewport = {
  themeColor: '#2E7D32',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
