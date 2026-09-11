'use client';

import { useState } from 'react';
import { cleanLines, titleCase } from '@/lib/calculations';
import { ActionRow } from '@/components/tool-shell';
import { PdfButton } from '@/components/pdf/pdf-button';

type TextAction = { label: string; run: (value: string) => string };
const actions: TextAction[] = [
  { label: 'Remove extra spaces', run: (v) => v.replace(/[ \t]+/g, ' ').trim() },
  { label: 'Remove blank lines', run: (v) => v.replace(/\n\s*\n+/g, '\n').trim() },
  { label: 'Normalize line breaks', run: (v) => v.replace(/\r\n?/g, '\n') },
  { label: 'Smart quotes → straight', run: (v) => v.replace(/[“”]/g, '"').replace(/[‘’]/g, "'") },
  { label: 'Lines → spaces', run: (v) => v.replace(/\s*\n+\s*/g, ' ') },
  { label: 'Sentence case', run: (v) => v.toLowerCase().replace(/(^|[.!?]\s+)\p{L}/gu, (m) => m.toUpperCase()) },
  { label: 'lowercase', run: (v) => v.toLowerCase() },
  { label: 'UPPERCASE', run: (v) => v.toUpperCase() },
  { label: 'Title Case', run: titleCase },
];

export function TextFixTool() {
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const working = text || input;
  const apply = (action: TextAction) => { setHistory((items) => [...items.slice(-19), text]); setText(action.run(working)); };
  const words = working.trim() ? working.trim().split(/\s+/).length : 0;
  return <div className="textfix-editor"><header><div><span>TextFix workspace</span><small>{words} words · {working.length} characters · {Math.max(1, Math.ceil(words / 200))} min read</small></div><p>Processed on this device.</p></header><nav className="editor-tools" aria-label="Text transformations">{actions.map((action) => <button key={action.label} onClick={() => apply(action)}>{action.label}</button>)}</nav><div className="editor-panes"><label><span>Input</span><textarea value={input} onChange={(e) => { setInput(e.target.value); setText(''); }} placeholder="Paste or type text here…" /></label><i aria-hidden="true">→</i><label><span>Output</span><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Choose a transformation to see the result" /></label></div><ActionRow><button className="button secondary" disabled={!history.length} onClick={() => { const previous = history.at(-1) ?? ''; setText(previous); setHistory((items) => items.slice(0, -1)); }}>Undo</button><button className="button secondary" onClick={() => { setHistory([]); setInput(''); setText(''); }}>Clear</button><PdfButton disabled={!working} report={{ tool: 'TextFix', title: 'Text Transformation', accent: '#4e6f72', hero: { label: 'Output', value: `${words} words`, detail: `${working.length} characters · ${Math.max(1, Math.ceil(words / 200))} min read` }, sections: [{ kind: 'text', title: 'Before', body: input || working }, { kind: 'text', title: 'After', body: working }] }}>Download PDF</PdfButton><button className="button" disabled={!working} onClick={() => navigator.clipboard?.writeText(working)}>Copy output</button></ActionRow></div>;
}

const stripPrefix = (line: string) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '');
export function ListCleanerTool() {
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const originalCount = cleanLines(input).length;
  const update = (lines: string[]) => setText(lines.join('\n'));
  const working = text || input;
  const lines = () => cleanLines(working);
  const outputCount = cleanLines(working).length;
  const unique = new Set(cleanLines(working).map((line) => line.toLocaleLowerCase())).size;
  const actions = [
    ['Remove duplicates', () => update(lines().filter((line, index, all) => all.findIndex((item) => item.toLocaleLowerCase() === line.toLocaleLowerCase()) === index))],
    ['Alphabetize A–Z', () => update(lines().sort((a, b) => a.localeCompare(b)))],
    ['Alphabetize Z–A', () => update(lines().sort((a, b) => b.localeCompare(a)))],
    ['Reverse', () => update(lines().reverse())],
    ['Shuffle', () => update(lines().sort(() => Math.random() - .5))],
    ['Numbers ↑', () => update(lines().sort((a, b) => Number(a) - Number(b)))],
    ['Numbers ↓', () => update(lines().sort((a, b) => Number(b) - Number(a)))],
    ['Number list', () => update(lines().map((line, index) => `${index + 1}. ${stripPrefix(line)}`))],
    ['Add bullets', () => update(lines().map((line) => `• ${stripPrefix(line)}`))],
    ['Remove bullets/numbers', () => update(lines().map(stripPrefix))],
    ['Commas → lines', () => update(working.split(',').map((item) => item.trim()).filter(Boolean))],
    ['Lines → commas', () => setText(lines().join(', '))],
  ] as const;
  return <div className="list-workbench"><header><div><span>Dataset operations</span><strong>{originalCount} → {outputCount}</strong></div><p>{unique} unique entries · Processed on this device.</p></header><nav className="list-operations" aria-label="List operations">{actions.map(([label, run]) => <button key={label} onClick={run}>{label}</button>)}</nav><div className="list-pipeline"><label><span>Before</span><textarea value={input} onChange={(e) => { setInput(e.target.value); setText(''); }} placeholder={'apple\nbanana\napple\nmango'} /></label><div className="pipeline-arrow"><b>→</b><small>{originalCount - unique > 0 ? `${originalCount - unique} duplicates found` : 'Ready'}</small></div><label><span>After</span><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Apply an operation" /></label></div><ActionRow><button className="button secondary" onClick={() => { setInput(''); setText(''); }}>Clear</button><PdfButton disabled={!working} report={{ tool: 'ListCleaner', title: 'List Transformation', accent: '#5e7281', hero: { label: 'Dataset result', value: `${originalCount} → ${outputCount}`, detail: `${unique} unique entries` }, sections: [{ kind: 'table', title: 'Before and after', columns: [{ key: 'number', label: '#' }, { key: 'before', label: 'Before' }, { key: 'after', label: 'After' }], rows: Array.from({ length: Math.max(cleanLines(input).length, cleanLines(working).length) }, (_, index) => ({ number: index + 1, before: cleanLines(input)[index] || '', after: cleanLines(working)[index] || '' })) }] }}>Download PDF</PdfButton><button className="button" disabled={!working} onClick={() => navigator.clipboard?.writeText(working)}>Copy output</button></ActionRow></div>;
}
