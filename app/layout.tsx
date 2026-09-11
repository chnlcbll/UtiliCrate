import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './tool-worlds.css';
import { PreferencesProvider } from '@/components/preferences-provider';

const geistSans = localFont({
  src: '../public/fonts/Geist-Regular.ttf',
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://utilicrate.syaneeel.chatgpt.site'),
  title: 'UtiliCrate — Useful tools. One place.',
  description: 'A polished collection of everyday calculators and utilities without the clutter.',
  icons: { icon: '/utilicrate-logo.png', apple: '/utilicrate-logo.png' },
  openGraph: {
    title: 'UtiliCrate — Useful tools. One place.',
    description: 'A polished collection of everyday calculators and utilities without the clutter.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'UtiliCrate — Useful tools. One place.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UtiliCrate — Useful tools. One place.',
    description: 'A polished collection of everyday calculators and utilities without the clutter.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
