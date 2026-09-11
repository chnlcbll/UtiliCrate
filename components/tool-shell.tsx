'use client';

import { useEffect, useState } from 'react';
import type { ToolMeta } from '@/data/tools';
import { rememberRecent } from '@/lib/storage';
import { SiteNav } from '@/components/site-nav';
import { ToolIcon } from '@/components/tool-icon';
import { ResultFeedback } from '@/components/result-feedback';

export function ToolShell({ tool, children }: { tool: ToolMeta; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => rememberRecent(tool.slug), [tool.slug]);
  // Tool inputs may intentionally use device time, locale, or locally saved data.
  // Render their interactive surface only after hydration so the server and
  // browser always agree on the initial tree.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return (
    <main className={`tool-world world-${tool.slug}`} data-tool={tool.slug}>
      <ResultFeedback rootSelector={`[data-tool="${tool.slug}"]`} />
      <SiteNav />
      <div className={`tool-page tool-page-${tool.slug} wrap`}>
        <a href="/" className="back-link">← All tools</a>
        <div className="tool-title">
          <span className="tool-icon"><ToolIcon slug={tool.slug} size={25} /></span>
          <div><span className="tool-category">{tool.category}</span><h1>{tool.name}</h1><p>{tool.description}</p></div>
        </div>
        {mounted ? children : <div className="tool-loading" role="status" aria-label={`Loading ${tool.name}`}><span /></div>}
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
