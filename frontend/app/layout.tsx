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

// iOS ignores the web manifest for its launch screen, so a splash image has
// to be supplied per device size via apple-touch-startup-image link tags —
// there's no single "any size" option like Android/Chrome gets automatically
// from the manifest's background_color + icon.
const APPLE_SPLASH_SCREENS: { size: string; media: string }[] = [
  { size: '640-1136', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
  { size: '750-1334', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
  { size: '828-1792', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
  { size: '1125-2436', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
  { size: '1170-2532', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
  { size: '1179-2556', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
  { size: '1284-2778', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
  { size: '1290-2796', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
  { size: '1536-2048', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
  { size: '1668-2388', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
  { size: '2048-2732', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {APPLE_SPLASH_SCREENS.map((screen) => (
          <link
            key={screen.size}
            rel="apple-touch-startup-image"
            href={`/splash/apple-splash-${screen.size}.png`}
            media={`${screen.media} and (orientation: portrait)`}
          />
        ))}
      </head>
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
