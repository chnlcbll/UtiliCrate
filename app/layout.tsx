import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://utilicrate.syaneeel.chatgpt.site'),
  title: 'UtiliCrate — Useful tools. One place.',
  description: 'Fast, private everyday calculators and utilities without the clutter.',
  icons: { icon: '/utilicrate-logo.png', apple: '/utilicrate-logo.png' },
  openGraph: {
    title: 'UtiliCrate — Useful tools. One place.',
    description: 'Fast, private everyday calculators and utilities without the clutter.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'UtiliCrate — Useful tools. One place.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UtiliCrate — Useful tools. One place.',
    description: 'Fast, private everyday calculators and utilities without the clutter.',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
