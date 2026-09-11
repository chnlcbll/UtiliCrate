'use client';

import { useMemo, useState } from 'react';
import { calculatePercentage, calendarDiff, formatCurrency, type PercentageMode, unitRate } from '@/lib/calculations';
import { ActionRow, Field } from '@/components/tool-shell';
import { PdfButton } from '@/components/pdf/pdf-button';

const modes: { value: PercentageMode; label: string; a: string; b: string; suffix: string }[] = [
  { value: 'of', label: 'X% of Y', a: 'Percentage', b: 'Value', suffix: '' },
  { value: 'what-percent', label: 'X is what % of Y', a: 'Part', b: 'Whole', suffix: '%' },
  { value: 'increase', label: '% increase', a: 'From', b: 'To', suffix: '%' },
  { value: 'decrease', label: '% decrease', a: 'From', b: 'To', suffix: '%' },
  { value: 'add', label: 'Increase by %', a: 'Value', b: 'Percentage', suffix: '' },
  { value: 'subtract', label: 'Decrease by %', a: 'Value', b: 'Percentage', suffix: '' },
  { value: 'original-up', label: 'Original before increase', a: 'Final value', b: 'Increase', suffix: '' },
  { value: 'original-down', label: 'Original before decrease', a: 'Final value', b: 'Decrease', suffix: '' },
  { value: 'difference', label: '% difference', a: 'First value', b: 'Second value', suffix: '%' },
];

export function PercentageTool() {
  const [mode, setMode] = useState<PercentageMode>('of');
  const [a, setA] = useState('20');
  const [b, setB] = useState('500');
  const selected = modes.find((item) => item.value === mode)!;
  const result = calculatePercentage(mode, Number(a), Number(b));
  const valid = a !== '' && b !== '' && Number.isFinite(result);
  const display = valid ? `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(result)}${selected.suffix}` : 'Enter valid values';
  return <div className="percentage-lab">
    <section className="math-controls">
      <Field label="Calculation"><select value={mode} onChange={(event) => setMode(event.target.value as PercentageMode)}>{modes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
      <div className="field-grid"><Field label={selected.a}><input type="number" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} /></Field><Field label={selected.b}><input type="number" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} /></Field></div>
      <ActionRow><button className="button secondary" onClick={() => { setA(''); setB(''); }}>Reset</button><PdfButton disabled={!valid} report={{ tool: 'Percentage', title: 'Percentage Calculation', accent: '#b0c75f', hero: { label: 'Result', value: display, detail: selected.label }, sections: [{ kind: 'metrics', items: [{ label: selected.a, value: a }, { label: selected.b, value: b }] }, { kind: 'text', title: 'Calculation', body: `${selected.label}: ${a} and ${b} produces ${display}.` }] }}>Download PDF</PdfButton><button className="button" onClick={() => navigator.clipboard?.writeText(display)} disabled={!valid}>Copy result</button></ActionRow>
    </section>
    <section className="math-display" aria-live="polite"><span>{valid ? selected.label : 'Check the equation'}</span><strong>{display}</strong><i aria-hidden="true">=</i><p>{valid ? `${a} · ${b}` : 'Both fields are required. Division by zero is not allowed.'}</p></section>
  </div>;
}

type UnitOption = { price: string; quantity: string; unit: string };
export function UnitPriceTool() {
  const [a, setA] = useState<UnitOption>({ price: '189', quantity: '750', unit: 'ml' });
  const [b, setB] = useState<UnitOption>({ price: '249', quantity: '1.2', unit: 'l' });
  const rateA = unitRate(Number(a.price), Number(a.quantity), a.unit);
  const rateB = unitRate(Number(b.price), Number(b.quantity), b.unit);
  const valid = Number.isFinite(rateA) && Number.isFinite(rateB);
  const winner = valid ? (rateA <= rateB ? 'Option A' : 'Option B') : '';
  const cheaper = Math.min(rateA, rateB);
  const pricier = Math.max(rateA, rateB);
  const units = ['mg', 'g', 'kg', 'ml', 'l', 'cm', 'm', 'piece', 'custom'];
  const option = (label: string, value: UnitOption, setValue: (next: UnitOption) => void) => <div className="sub-card"><h3>{label}</h3><div className="field-grid"><Field label="Price"><input type="number" min="0" value={value.price} onChange={(e) => setValue({ ...value, price: e.target.value })} /></Field><Field label="Quantity"><input type="number" min="0" value={value.quantity} onChange={(e) => setValue({ ...value, quantity: e.target.value })} /></Field></div><Field label="Unit"><select value={value.unit} onChange={(e) => setValue({ ...value, unit: e.target.value })}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></Field></div>;
  return <div className="unit-arena"><section className="unit-options">{option('Option A', a, setA)}<span className="versus">VS</span>{option('Option B', b, setB)}</section><ActionRow><PdfButton disabled={!valid} report={{ tool: 'UnitPrice', title: 'Unit Price Comparison', accent: '#9b6d42', hero: { label: 'Better value', value: winner, detail: `${formatCurrency(cheaper)} per base unit` }, sections: [{ kind: 'table', title: 'Product comparison', columns: [{ key: 'option', label: 'Option' }, { key: 'price', label: 'Price', align: 'right' }, { key: 'quantity', label: 'Quantity', align: 'right' }, { key: 'rate', label: 'Per base unit', align: 'right' }], rows: [{ option: 'Option A', price: formatCurrency(Number(a.price)), quantity: `${a.quantity} ${a.unit}`, rate: formatCurrency(rateA) }, { option: 'Option B', price: formatCurrency(Number(b.price)), quantity: `${b.quantity} ${b.unit}`, rate: formatCurrency(rateB) }] }, { kind: 'bars', title: 'Unit cost', items: [{ label: 'Option A', value: rateA, display: formatCurrency(rateA) }, { label: 'Option B', value: rateB, display: formatCurrency(rateB) }], note: `${winner} is ${formatCurrency(pricier - cheaper)} cheaper per base unit (${((pricier - cheaper) / pricier * 100).toFixed(1)}%).` }] }}>Download PDF</PdfButton></ActionRow><section className="unit-verdict" aria-live="polite"><span>{valid ? 'Better value' : 'Compare two products'}</span><strong>{valid ? winner : 'Enter valid amounts'}</strong>{valid && <><div className="unit-rates"><p><b>A</b>{formatCurrency(rateA)}<small>per base unit</small></p><p className={winner === 'Option B' ? 'winner' : ''}><b>B</b>{formatCurrency(rateB)}<small>per base unit</small></p></div><p>{formatCurrency(pricier - cheaper)} cheaper per base unit · {((pricier - cheaper) / pricier * 100).toFixed(1)}% less</p></>}</section></div>;
}

const today = () => new Date().toISOString().slice(0, 10);
const dateInput = (value: string) => new Date(`${value}T00:00:00`);

export function HowLongTool() {
  const [start, setStart] = useState('2024-01-01');
  const [end, setEnd] = useState(today());
  const [inclusive, setInclusive] = useState(false);
  const data = useMemo(() => {
    if (!start || !end) return null;
    const from = dateInput(start); const to = dateInput(end); if (inclusive) to.setDate(to.getDate() + (to >= from ? 1 : -1)); return calendarDiff(from, to);
  }, [start, end, inclusive]);
  return <div className="duration-map"><section className="duration-controls"><Field label="Start date"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field><label className="check-row"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} /> Include end date</label><Field label="End date"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field><PdfButton disabled={!data} report={{ tool: 'HowLong', title: 'Duration Between Dates', accent: '#55768d', hero: { label: 'Calendar duration', value: data ? `${data.years}y ${data.months}m ${data.days}d` : 'No result', detail: data ? `${data.totalDays.toLocaleString()} total days` : undefined }, sections: [{ kind: 'timeline', title: 'Date span', start, end }, { kind: 'metrics', items: data ? [{ label: 'Total days', value: data.totalDays.toLocaleString() }, { label: 'Weeks', value: (data.totalDays / 7).toFixed(1) }, { label: 'Hours', value: (data.totalDays * 24).toLocaleString() }, { label: 'Minutes', value: (data.totalDays * 1440).toLocaleString() }] : [] }, { kind: 'text', title: 'Counting method', body: inclusive ? 'The end date is included in this calculation.' : 'The duration excludes the end date.' }] }}>Download PDF</PdfButton></section><section className="duration-line" aria-live="polite"><div><span>Start</span><strong>{start || '—'}</strong></div><i><b>{data ? data.totalDays.toLocaleString() : '—'}</b><small>days between</small></i><div><span>End</span><strong>{end || '—'}</strong></div></section><section className="duration-answer"><strong>{data ? `${data.years} years, ${data.months} months, ${data.days} days` : 'Choose two dates'}</strong>{data && <p>{(data.totalDays / 7).toFixed(1)} weeks · {(data.totalDays * 24).toLocaleString()} hours · {(data.totalDays * 1440).toLocaleString()} minutes</p>}</section></div>;
}

export function TimeAgoTool() {
  const [date, setDate] = useState('2020-01-01');
  const target = date ? dateInput(date) : null;
  const data = target ? calendarDiff(target, new Date()) : null;
  const natural = data ? `${data.forward ? '' : 'in '}${data.years ? `${data.years} years, ` : ''}${data.months} months and ${data.days} days${data.forward ? ' ago' : ''}` : 'Choose a date';
  return <div className="time-distance"><section className="time-input"><Field label="Place a date on the timeline"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field><PdfButton disabled={!data || !target} report={{ tool: 'TimeAgo', title: 'Distance From Now', accent: '#596c91', hero: { label: data?.forward ? 'Time elapsed' : 'Time remaining', value: natural, detail: target?.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }, sections: [{ kind: 'timeline', title: 'Then and now', start: data?.forward ? date : 'Today', end: data?.forward ? 'Today' : date }, { kind: 'metrics', items: data ? [{ label: 'Total days', value: data.totalDays.toLocaleString() }, { label: 'Weeks', value: Math.floor(data.totalDays / 7).toLocaleString() }, { label: 'Calendar years', value: String(data.years) }, { label: 'Calendar months', value: String(data.months) }] : [] }] }}>Download PDF</PdfButton></section><section className="time-statement" aria-live="polite"><span>{data?.forward ? 'Past' : 'Future'}</span><strong>{natural}</strong>{data && <p>{data.totalDays.toLocaleString()} days · {Math.floor(data.totalDays / 7).toLocaleString()} weeks</p>}</section><div className={data?.forward ? 'now-axis past' : 'now-axis future'}><i /><span>{data?.forward ? 'Then' : 'Now'}</span><b>Now</b><span>{data?.forward ? 'Now' : 'Then'}</span></div>{target && <p className="exact-date">{target.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}</div>;
}

export function AgeCalcTool() {
  const [birth, setBirth] = useState('2000-01-01');
  const born = birth ? dateInput(birth) : null;
  const now = new Date();
  const data = born && born <= now ? calendarDiff(born, now) : null;
  let nextBirthday: Date | null = null;
  if (born && data) { nextBirthday = new Date(now.getFullYear(), born.getMonth(), born.getDate()); if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1); }
  const until = nextBirthday ? Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000) : 0;
  return <div className="age-chronicle"><section className="age-input"><Field label="Your birth date"><input type="date" max={today()} value={birth} onChange={(e) => setBirth(e.target.value)} /></Field><p>One date, seen across a lifetime.</p><PdfButton disabled={!data || !born} report={{ tool: 'AgeCalc', title: 'Age & Milestones', accent: '#806b91', hero: { label: 'Current age', value: data ? `${data.years} years` : 'No result', detail: data ? `${data.months} months and ${data.days} days beyond the last birthday` : undefined }, sections: [{ kind: 'timeline', title: 'Life timeline', start: born?.toLocaleDateString() || birth, end: 'Today' }, { kind: 'metrics', items: data && born ? [{ label: 'Exact age', value: `${data.years}y ${data.months}m ${data.days}d` }, { label: 'Days lived', value: data.totalDays.toLocaleString() }, { label: 'Next birthday', value: `${until} days` }, { label: 'Born on', value: born.toLocaleDateString(undefined, { weekday: 'long' }) }] : [] }] }}>Download PDF</PdfButton></section><section className="age-hero" aria-live="polite"><span>You are</span><strong>{data ? data.years : '—'}</strong><i>years old</i></section>{data && born && <section className="age-milestones"><div><small>Exact age</small><strong>{data.years}y {data.months}m {data.days}d</strong></div><div><small>Days lived</small><strong>{data.totalDays.toLocaleString()}</strong></div><div><small>Next birthday</small><strong>{until} days</strong></div><div><small>Born on</small><strong>{born.toLocaleDateString(undefined, { weekday: 'long' })}</strong></div></section>}</div>;
}
