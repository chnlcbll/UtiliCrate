'use client';

import { useState } from 'react';
import { cleanLines, titleCase } from '@/lib/calculations';
import { ActionRow, Result } from '@/components/tool-shell';

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
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const apply = (action: TextAction) => { setHistory((items) => [...items.slice(-19), text]); setText(action.run(text)); };
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return <div className="tool-layout wide-result"><section className="control-card"><div className="editor-heading"><span>Editing workspace</span><small>{words} words · {text.length} characters · {Math.max(1, Math.ceil(words / 200))} min read</small></div><textarea className="large-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type text here…" /><div className="button-cloud">{actions.map((action) => <button className="mini-button" key={action.label} onClick={() => apply(action)}>{action.label}</button>)}</div><ActionRow><button className="button secondary" disabled={!history.length} onClick={() => { const previous = history.at(-1) ?? ''; setText(previous); setHistory((items) => items.slice(0, -1)); }}>Undo</button><button className="button secondary" onClick={() => { setHistory((items) => [...items, text]); setText(''); }}>Clear</button><button className="button" disabled={!text} onClick={() => navigator.clipboard?.writeText(text)}>Copy</button></ActionRow></section><Result title={text ? 'Processed locally' : 'Your text stays private'}><p>Nothing you paste here is saved or sent anywhere.</p></Result></div>;
}

const stripPrefix = (line: string) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '');
export function ListCleanerTool() {
  const [text, setText] = useState('');
  const originalCount = cleanLines(text).length;
  const update = (lines: string[]) => setText(lines.join('\n'));
  const lines = () => cleanLines(text);
  const unique = new Set(lines().map((line) => line.toLocaleLowerCase())).size;
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
    ['Commas → lines', () => update(text.split(',').map((item) => item.trim()).filter(Boolean))],
    ['Lines → commas', () => setText(lines().join(', '))],
  ] as const;
  return <div className="tool-layout wide-result"><section className="control-card"><div className="editor-heading"><span>List workspace</span><small>{originalCount} entries · {unique} unique</small></div><textarea className="large-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={'apple\nbanana\napple\nmango'} /><div className="button-cloud">{actions.map(([label, run]) => <button className="mini-button" key={label} onClick={run}>{label}</button>)}</div><ActionRow><button className="button secondary" onClick={() => setText('')}>Clear</button><button className="button" disabled={!text} onClick={() => navigator.clipboard?.writeText(text)}>Copy</button></ActionRow></section><Result title={`${originalCount} entries → ${unique} unique entries`}><p>All list processing happens in this browser.</p></Result></div>;
}
