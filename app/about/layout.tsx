import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_NAME } from '@/lib/site';

const title = 'About & Privacy';
const description =
  'Learn how UtiliCrate works, how its tools handle data, and which published standards support its calculations.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: '/about',
    siteName: SITE_NAME,
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: `About ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | ${SITE_NAME}`,
    description,
    images: ['/og.png'],
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
