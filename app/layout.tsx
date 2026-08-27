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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Toolio — Useful tools. One place.',
  description: 'Fast, private everyday calculators and utilities without the clutter.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Toolio — Useful tools. One place.',
    description: 'Fast, private everyday calculators and utilities without the clutter.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Toolio — Useful tools. One place.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toolio — Useful tools. One place.',
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
