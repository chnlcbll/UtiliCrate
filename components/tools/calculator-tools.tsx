'use client';

import { useMemo, useState } from 'react';
import { calculatePercentage, calendarDiff, formatCurrency, type PercentageMode, unitRate } from '@/lib/calculations';
import { ActionRow, Field, Result } from '@/components/tool-shell';

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
  return <div className="tool-layout">
    <section className="control-card">
      <Field label="Calculation"><select value={mode} onChange={(event) => setMode(event.target.value as PercentageMode)}>{modes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
      <div className="field-grid"><Field label={selected.a}><input type="number" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} /></Field><Field label={selected.b}><input type="number" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} /></Field></div>
      <ActionRow><button className="button secondary" onClick={() => { setA(''); setB(''); }}>Reset</button><button className="button" onClick={() => navigator.clipboard?.writeText(display)} disabled={!valid}>Copy result</button></ActionRow>
    </section>
    <Result title={display}><p>{valid ? selected.label : 'Both fields are required. Division by zero is not allowed.'}</p></Result>
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
  return <div className="tool-layout"><section className="control-card split-cards">{option('Option A', a, setA)}{option('Option B', b, setB)}</section><Result eyebrow={valid ? 'Cheaper option' : 'Result'} title={valid ? winner : 'Enter valid prices and quantities'}>{valid && <div className="result-list"><span>A · {formatCurrency(rateA)} per base unit</span><span>B · {formatCurrency(rateB)} per base unit</span><span>{formatCurrency(pricier - cheaper)} cheaper per base unit · {((pricier - cheaper) / pricier * 100).toFixed(1)}% less</span></div>}</Result></div>;
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
  return <div className="tool-layout"><section className="control-card"><div className="field-grid"><Field label="Start date"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field><Field label="End date"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></Field></div><label className="check-row"><input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} /> Include end date</label></section><Result title={data ? `${data.years} years, ${data.months} months, ${data.days} days` : 'Choose two dates'}>{data && <div className="result-list"><span>{data.totalDays.toLocaleString()} total days</span><span>{(data.totalDays / 7).toFixed(1)} weeks</span><span>{(data.totalDays * 24).toLocaleString()} hours</span><span>{(data.totalDays * 1440).toLocaleString()} minutes</span></div>}</Result></div>;
}

export function TimeAgoTool() {
  const [date, setDate] = useState('2020-01-01');
  const target = date ? dateInput(date) : null;
  const data = target ? calendarDiff(target, new Date()) : null;
  const natural = data ? `${data.forward ? '' : 'in '}${data.years ? `${data.years} years, ` : ''}${data.months} months and ${data.days} days${data.forward ? ' ago' : ''}` : 'Choose a date';
  return <div className="tool-layout"><section className="control-card"><Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field></section><Result title={natural}>{data && target && <div className="result-list"><span>{data.totalDays.toLocaleString()} days {data.forward ? 'ago' : 'from now'}</span><span>{Math.floor(data.totalDays / 7).toLocaleString()} weeks</span><span>{target.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}</Result></div>;
}

export function AgeCalcTool() {
  const [birth, setBirth] = useState('2000-01-01');
  const born = birth ? dateInput(birth) : null;
  const now = new Date();
  const data = born && born <= now ? calendarDiff(born, now) : null;
  let nextBirthday: Date | null = null;
  if (born && data) { nextBirthday = new Date(now.getFullYear(), born.getMonth(), born.getDate()); if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1); }
  const until = nextBirthday ? Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000) : 0;
  return <div className="tool-layout"><section className="control-card"><Field label="Birth date"><input type="date" max={today()} value={birth} onChange={(e) => setBirth(e.target.value)} /></Field></section><Result eyebrow="You are" title={data ? `${data.years} years old` : 'Enter a valid birth date'}>{data && born && <div className="result-list"><span>{data.years} years, {data.months} months, {data.days} days</span><span>{Math.floor(data.totalDays / 7).toLocaleString()} weeks · {data.totalDays.toLocaleString()} days</span><span>Born on a {born.toLocaleDateString(undefined, { weekday: 'long' })}</span><span>Next birthday in {until} days</span></div>}</Result></div>;
}
