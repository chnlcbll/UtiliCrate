'use client';

import { useState } from 'react';
import type { PdfReport } from '@/lib/pdf/types';
import { usePreferences } from '@/components/preferences-provider';

export function PdfButton({ report, className = 'button secondary', disabled, children = 'Download PDF' }: { report: PdfReport | (() => PdfReport | Promise<PdfReport>); className?: string; disabled?: boolean; children?: React.ReactNode }) {
  const [status, setStatus] = useState<'idle' | 'preparing' | 'ready' | 'error'>('idle');
  const { playSound } = usePreferences();
  const download = async () => {
    if (disabled || status === 'preparing') return;
    setStatus('preparing');
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const input = typeof report === 'function' ? await report() : report;
      const { downloadPdfReport } = await import('@/lib/pdf/generate-pdf');
      await downloadPdfReport(input);
      setStatus('ready');
      playSound('success');
      window.setTimeout(() => setStatus('idle'), 1800);
    } catch (error) {
      console.error('PDF export failed', error);
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 2600);
    }
  };
  const label = status === 'preparing' ? 'Preparing PDF...' : status === 'ready' ? 'PDF ready' : status === 'error' ? 'Try PDF again' : children;
  return <button type="button" className={className} onClick={download} disabled={disabled || status === 'preparing'} aria-live="polite">{label}</button>;
}
