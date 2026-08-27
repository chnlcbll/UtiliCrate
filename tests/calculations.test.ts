import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePercentage, calculateReceiptShares, calendarDiff, dealMetrics, roundMoney, splitBill, unitRate, weightedScores } from '../lib/calculations.ts';

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
