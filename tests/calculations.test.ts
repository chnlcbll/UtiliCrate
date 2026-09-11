import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateBmi, calculateCountdown, calculateFuelCost, calculatePercentage, calculateProsCons, calculateReceiptShares, calculateSavingsGoal, calculateTripCost, calendarDiff, dealMetrics, isoWeekDates, isoWeekInfo, roundMoney, splitBill, unitRate, weightedScores } from '../lib/calculations.ts';

test('rounds financial values to cents', () => {
  assert.equal(roundMoney(249.9999997), 250);
});

test('splits a bill with fees, tax, and discount', () => {
  assert.deepEqual(splitBill(1000, 4, 100, 10, 50), { tax: 100, grandTotal: 1150, each: 287.5 });
});

test('supports all core percentage operations', () => {
  assert.equal(calculatePercentage('of', 20, 500), 100);
  assert.equal(calculatePercentage('what-percent', 25, 100), 25);
  assert.equal(calculatePercentage('increase', 100, 125), 25);
  assert.equal(calculatePercentage('original-down', 80, 20), 100);
});

test('normalizes unit quantities', () => {
  assert.equal(unitRate(189, 750, 'ml'), 189 / 750);
  assert.equal(unitRate(249, 1.2, 'l'), 249 / 1200);
});

test('calculates calendar duration', () => {
  assert.deepEqual(calendarDiff(new Date('2020-01-01'), new Date('2022-03-09')), { years: 2, months: 2, days: 8, totalDays: 798, forward: true });
});

test('compares discounted and bundled deals', () => {
  assert.deepEqual(dealMetrics(499, 1, 20, 0, 0), { effectiveTotal: 399.2, perItem: 399.2, itemCount: 1 });
  assert.equal(dealMetrics(200, 2, 0, 0, 1).perItem, 133.33);
});

test('normalizes weighted decision criteria', () => {
  const scores = weightedScores([{ id: 'a', ratings: { price: 10, food: 5 } }, { id: 'b', ratings: { price: 5, food: 10 } }], [{ id: 'price', weight: 70 }, { id: 'food', weight: 30 }]);
  assert.equal(scores[0].id, 'a');
  assert.equal(scores[0].score, 8.5);
});

test('splits shared receipt items and proportional fees', () => {
  const shares = calculateReceiptShares([{ id: 'a' }, { id: 'b' }], [{ price: 300, quantity: 1, assigned: ['a'] }, { price: 200, quantity: 1, assigned: ['a', 'b'] }], 50, 0);
  assert.deepEqual(shares, [{ id: 'a', itemTotal: 400, fee: 40, discount: 0, total: 440 }, { id: 'b', itemTotal: 100, fee: 10, discount: 0, total: 110 }]);
});

test('calculates savings contribution needs and shortfall', () => {
  const result = calculateSavingsGoal({ target: 70000, saved: 24500, targetDate: new Date('2026-12-20T00:00:00Z'), now: new Date('2026-08-22T00:00:00Z'), contribution: 1000, frequency: 'weekly' });
  assert.equal(result.daysRemaining, 120);
  assert.equal(result.perDay, 379.17);
  assert.equal(result.enough, false);
  assert.ok(result.shortfall > 0);
});

test('calculates countdowns across a leap day and year boundary', () => {
  const leap = calculateCountdown(new Date('2024-03-01T00:00:00Z'), new Date('2024-02-28T00:00:00Z'));
  assert.equal(leap.days, 2);
  const boundary = calculateCountdown(new Date('2027-01-01T00:00:00Z'), new Date('2026-12-31T23:00:00Z'));
  assert.equal(boundary.hours, 1);
});

test('uses ISO-8601 week years and supports week 53', () => {
  assert.deepEqual({ week: isoWeekInfo(new Date('2021-01-01T00:00:00Z')).week, year: isoWeekInfo(new Date('2021-01-01T00:00:00Z')).weekYear }, { week: 53, year: 2020 });
  assert.deepEqual({ week: isoWeekInfo(new Date('2018-12-31T00:00:00Z')).week, year: isoWeekInfo(new Date('2018-12-31T00:00:00Z')).weekYear }, { week: 1, year: 2019 });
  assert.equal(isoWeekInfo(new Date('2024-12-31T00:00:00Z')).dayOfYear, 366);
  const week53 = isoWeekDates(2020, 53);
  assert.equal(week53.valid, true);
  assert.equal(week53.monday.toISOString().slice(0, 10), '2020-12-28');
});

test('calculates adult BMI in metric and imperial units', () => {
  assert.equal(calculateBmi(68, 170, 'metric').bmi.toFixed(1), '23.5');
  assert.equal(calculateBmi(150, 66, 'imperial').bmi.toFixed(1), '24.2');
});

test('totals trip entries by person and day without float artifacts', () => {
  const result = calculateTripCost([{ amount: 1000, perPerson: true, category: 'Transport' }, { amount: 500, perDay: true, category: 'Food' }], 2, 3);
  assert.deepEqual(result, { total: 3500, perTraveler: 1750, perDay: 1166.67, perTravelerPerDay: 583.33, totalsByCategory: { Transport: 2000, Food: 1500 } });
});

test('converts fuel efficiency units consistently', () => {
  assert.equal(calculateFuelCost({ distance: 100, distanceUnit: 'km', efficiency: 10, efficiencyUnit: 'km/L', price: 60 }).total, 600);
  assert.equal(calculateFuelCost({ distance: 100, distanceUnit: 'km', efficiency: 10, efficiencyUnit: 'L/100km', price: 60 }).total, 600);
  assert.ok(Math.abs(calculateFuelCost({ distance: 62.1371, distanceUnit: 'miles', efficiency: 23.5215, efficiencyUnit: 'MPG', price: 60 }).liters - 10) < .001);
});

test('scores weighted and unweighted pros and cons', () => {
  const items = [{ side: 'pro' as const, weight: 5 }, { side: 'pro' as const, weight: 3 }, { side: 'con' as const, weight: 4 }];
  assert.deepEqual(calculateProsCons(items, true), { pros: 8, cons: 4, net: 4 });
  assert.deepEqual(calculateProsCons(items, false), { pros: 2, cons: 1, net: 1 });
});
