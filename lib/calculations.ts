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

const DAY_MS = 86_400_000;

export type ContributionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export function calculateSavingsGoal(input: { target: number; saved: number; targetDate: Date; now?: Date; contribution?: number; frequency?: ContributionFrequency }) {
  const now = input.now ?? new Date();
  const target = Math.max(0, input.target);
  const saved = Math.max(0, input.saved);
  const remaining = Math.max(0, target - saved);
  const daysRemaining = Math.max(0, Math.ceil((input.targetDate.getTime() - now.getTime()) / DAY_MS));
  const perDay = daysRemaining ? remaining / daysRemaining : remaining;
  const periodsPerYear: Record<ContributionFrequency, number> = { daily: 365, weekly: 52, biweekly: 26, monthly: 12 };
  const contributionDaily = Math.max(0, input.contribution ?? 0) * periodsPerYear[input.frequency ?? 'monthly'] / 365;
  const projectedDays = remaining === 0 ? 0 : contributionDaily > 0 ? Math.ceil(remaining / contributionDaily) : Infinity;
  const projectedDate = Number.isFinite(projectedDays) ? new Date(now.getTime() + projectedDays * DAY_MS) : null;
  const projectedByTarget = contributionDaily * daysRemaining;
  return {
    remaining: roundMoney(remaining),
    percent: target ? Math.min(100, saved / target * 100) : 0,
    daysRemaining,
    perDay: roundMoney(perDay),
    perWeek: roundMoney(perDay * 7),
    perMonth: roundMoney(perDay * 365 / 12),
    projectedDate,
    enough: remaining === 0 || projectedByTarget >= remaining,
    shortfall: roundMoney(Math.max(0, remaining - projectedByTarget)),
  };
}

export function calculateCountdown(target: Date, now = new Date(), start?: Date) {
  const difference = target.getTime() - now.getTime();
  const absolute = Math.abs(difference);
  const totalSeconds = Math.floor(absolute / 1000);
  const totalHours = absolute / 3_600_000;
  const totalDays = absolute / DAY_MS;
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor(totalSeconds % 86_400 / 3_600);
  const minutes = Math.floor(totalSeconds % 3_600 / 60);
  const seconds = totalSeconds % 60;
  const duration = start ? target.getTime() - start.getTime() : 0;
  const elapsedPercent = duration > 0 ? Math.max(0, Math.min(100, (now.getTime() - start!.getTime()) / duration * 100)) : null;
  return { future: difference >= 0, difference, days, hours, minutes, seconds, totalDays, totalHours, weeks: totalDays / 7, elapsedPercent };
}

export function isoWeekInfo(date: Date) {
  const source = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekdayNumber = source.getUTCDay() || 7;
  const thursday = new Date(source);
  thursday.setUTCDate(source.getUTCDate() + 4 - weekdayNumber);
  const weekYear = thursday.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil((((thursday.getTime() - yearStart.getTime()) / DAY_MS) + 1) / 7);
  const weekStart = new Date(source);
  weekStart.setUTCDate(source.getUTCDate() - weekdayNumber + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const calendarStart = new Date(Date.UTC(source.getUTCFullYear(), 0, 1));
  const nextYear = new Date(Date.UTC(source.getUTCFullYear() + 1, 0, 1));
  const dayOfYear = Math.floor((source.getTime() - calendarStart.getTime()) / DAY_MS) + 1;
  const daysInYear = Math.round((nextYear.getTime() - calendarStart.getTime()) / DAY_MS);
  return { week, weekYear, weekStart, weekEnd, weekday: weekdayNumber, dayOfYear, daysInYear, daysRemaining: daysInYear - dayOfYear, quarter: Math.floor(source.getUTCMonth() / 3) + 1 };
}

export function isoWeekDates(year: number, week: number) {
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const day = januaryFourth.getUTCDay() || 7;
  const monday = new Date(januaryFourth);
  monday.setUTCDate(januaryFourth.getUTCDate() - day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { monday, sunday, valid: isoWeekInfo(monday).weekYear === year && isoWeekInfo(monday).week === week };
}

export function calculateBmi(weight: number, height: number, system: 'metric' | 'imperial') {
  const bmi = system === 'metric' ? weight / ((height / 100) ** 2) : 703 * weight / (height ** 2);
  const heightMeters = system === 'metric' ? height / 100 : height * 0.0254;
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy weight' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obesity, class I' : bmi < 40 ? 'Obesity, class II' : 'Obesity, class III';
  return { bmi, category, referenceMinKg: 18.5 * heightMeters ** 2, referenceMaxKg: 24.9 * heightMeters ** 2 };
}

export type TripCostEntry = { amount: number; quantity?: number; perPerson?: boolean; perDay?: boolean; category?: string };
export function calculateTripCost(entries: TripCostEntry[], travelers: number, days: number) {
  const people = Math.max(1, travelers);
  const tripDays = Math.max(1, days);
  const totalsByCategory: Record<string, number> = {};
  const total = entries.reduce((sum, entry) => {
    const value = Math.max(0, entry.amount) * Math.max(1, entry.quantity ?? 1) * (entry.perPerson ? people : 1) * (entry.perDay ? tripDays : 1);
    const category = entry.category || 'Miscellaneous';
    totalsByCategory[category] = roundMoney((totalsByCategory[category] ?? 0) + value);
    return sum + value;
  }, 0);
  return { total: roundMoney(total), perTraveler: roundMoney(total / people), perDay: roundMoney(total / tripDays), perTravelerPerDay: roundMoney(total / people / tripDays), totalsByCategory };
}

export type FuelEfficiencyUnit = 'km/L' | 'L/100km' | 'MPG';
export function calculateFuelCost(input: { distance: number; distanceUnit: 'km' | 'miles'; efficiency: number; efficiencyUnit: FuelEfficiencyUnit; price: number; passengers?: number; roundTrip?: boolean }) {
  const multiplier = input.roundTrip ? 2 : 1;
  const distance = Math.max(0, input.distance) * multiplier;
  const distanceKm = input.distanceUnit === 'km' ? distance : distance * 1.609344;
  const efficiency = Math.max(0, input.efficiency);
  let liters = 0;
  if (efficiency > 0 && input.efficiencyUnit === 'km/L') liters = distanceKm / efficiency;
  if (efficiency > 0 && input.efficiencyUnit === 'L/100km') liters = distanceKm * efficiency / 100;
  if (efficiency > 0 && input.efficiencyUnit === 'MPG') liters = (distanceKm / 1.609344) / efficiency * 3.785411784;
  const total = liters * Math.max(0, input.price);
  return { distance, liters, total: roundMoney(total), perDistance: roundMoney(distance ? total / distance : 0), perPerson: roundMoney(total / Math.max(1, input.passengers ?? 1)) };
}

export function calculateProsCons(items: { side: 'pro' | 'con'; weight?: number }[], weighted: boolean) {
  const value = (item: { weight?: number }) => weighted ? Math.max(1, Math.min(5, item.weight ?? 1)) : 1;
  const pros = items.filter((item) => item.side === 'pro').reduce((sum, item) => sum + value(item), 0);
  const cons = items.filter((item) => item.side === 'con').reduce((sum, item) => sum + value(item), 0);
  return { pros, cons, net: pros - cons };
}
