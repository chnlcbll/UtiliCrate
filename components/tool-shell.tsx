'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { ToolMeta } from '@/data/tools';
import { rememberRecent } from '@/lib/storage';
import { Brand } from '@/components/brand';

export function ToolShell({ tool, children }: { tool: ToolMeta; children: React.ReactNode }) {
  useEffect(() => rememberRecent(tool.slug), [tool.slug]);
  return (
    <main>
      <header className="site-header">
        <Brand />
        <Link href="/about" className="header-link">About & privacy</Link>
      </header>
      <div className="tool-page wrap">
        <Link href="/" className="back-link">← All tools</Link>
        <div className="tool-title">
          <span className="tool-icon">{tool.icon}</span>
          <div><h1>{tool.name}</h1><p>{tool.description}</p></div>
        </div>
        {children}
      </div>
    </main>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function Result({ eyebrow = 'Result', title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return <section className="result-card" aria-live="polite"><span>{eyebrow}</span><strong>{title}</strong>{children}</section>;
}

export function ActionRow({ children }: { children: React.ReactNode }) {
  return <div className="action-row">{children}</div>;
}
