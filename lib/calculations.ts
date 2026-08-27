export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export const clampNumber = (value: number, fallback = 0) => Number.isFinite(value) ? value : fallback;

export function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat(currency === 'PHP' ? 'en-PH' : undefined, { style: 'currency', currency, minimumFractionDigits: 2 }).format(roundMoney(value));
}

export function splitBill(total: number, count: number, fees: number, taxRate: number, discount: number) {
  const subtotal = Math.max(0, total);
  const tax = subtotal * Math.max(0, taxRate) / 100;
  const grandTotal = Math.max(0, subtotal + Math.max(0, fees) + tax - Math.max(0, discount));
  return { tax: roundMoney(tax), grandTotal: roundMoney(grandTotal), each: roundMoney(count > 0 ? grandTotal / count : 0) };
}

export type PercentageMode = 'of' | 'what-percent' | 'increase' | 'decrease' | 'add' | 'subtract' | 'original-up' | 'original-down' | 'difference';
export function calculatePercentage(mode: PercentageMode, a: number, b: number) {
  switch (mode) {
    case 'of': return a * b / 100;
    case 'what-percent': return b === 0 ? NaN : a / b * 100;
    case 'increase': return a === 0 ? NaN : (b - a) / Math.abs(a) * 100;
    case 'decrease': return a === 0 ? NaN : (a - b) / Math.abs(a) * 100;
    case 'add': return a * (1 + b / 100);
    case 'subtract': return a * (1 - b / 100);
    case 'original-up': return 1 + b / 100 === 0 ? NaN : a / (1 + b / 100);
    case 'original-down': return 1 - b / 100 === 0 ? NaN : a / (1 - b / 100);
    case 'difference': return a + b === 0 ? 0 : Math.abs(a - b) / ((Math.abs(a) + Math.abs(b)) / 2) * 100;
  }
}

const unitFactors: Record<string, number> = { mg: 0.001, g: 1, kg: 1000, ml: 1, l: 1000, cm: 0.01, m: 1, piece: 1, custom: 1 };
export function unitRate(price: number, quantity: number, unit: string) {
  const base = quantity * (unitFactors[unit] ?? 1);
  return base > 0 ? price / base : NaN;
}

export function calendarDiff(from: Date, to: Date) {
  const forward = to >= from;
  const start = forward ? from : to;
  const end = forward ? to : from;
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) { years -= 1; months += 12; }
  const totalDays = Math.floor(Math.abs(end.getTime() - start.getTime()) / 86400000);
  return { years, months, days, totalDays, forward };
}

export function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

export function cleanLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export function dealMetrics(price: number, quantity: number, discount: number, cashback: number, freeItems: number) {
  const paidQuantity = Math.max(1, quantity);
  const effectiveTotal = Math.max(0, price * paidQuantity * (1 - Math.max(0, discount) / 100) - Math.max(0, cashback));
  const itemCount = Math.max(1, paidQuantity + Math.max(0, freeItems));
  return { effectiveTotal: roundMoney(effectiveTotal), perItem: roundMoney(effectiveTotal / itemCount), itemCount };
}

export function weightedScores(
  options: { id: string; ratings: Record<string, number> }[],
  criteria: { id: string; weight: number }[],
) {
  const totalWeight = criteria.reduce((sum, criterion) => sum + Math.max(0, criterion.weight), 0);
  return options.map((option) => ({
    id: option.id,
    score: totalWeight ? criteria.reduce((sum, criterion) => sum + (option.ratings[criterion.id] ?? 0) * Math.max(0, criterion.weight) / totalWeight, 0) : 0,
  })).sort((a, b) => b.score - a.score);
}

export function calculateReceiptShares(
  people: { id: string }[],
  items: { price: number; quantity: number; assigned: string[] }[],
  fee: number,
  discount: number,
) {
  const subtotal = items.reduce((sum, item) => sum + Math.max(0, item.price) * Math.max(0, item.quantity), 0);
  return people.map((person) => {
    const itemTotal = items.reduce((sum, item) => item.assigned.includes(person.id) && item.assigned.length
      ? sum + Math.max(0, item.price) * Math.max(0, item.quantity) / item.assigned.length : sum, 0);
    const proportion = subtotal ? itemTotal / subtotal : 0;
    return { id: person.id, itemTotal: roundMoney(itemTotal), fee: roundMoney(Math.max(0, fee) * proportion), discount: roundMoney(Math.max(0, discount) * proportion), total: roundMoney(Math.max(0, itemTotal + fee * proportion - discount * proportion)) };
  });
}
