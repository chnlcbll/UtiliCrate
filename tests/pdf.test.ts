import assert from 'node:assert/strict';
import test from 'node:test';

import { pdfFilename, safeFilenamePart } from '../lib/pdf/filename.ts';

test('safeFilenamePart removes unsafe filename characters', () => {
  assert.equal(safeFilenamePart(' Bohol / 4 days: ₱70,000 '), 'Bohol-4-days-70-000');
});

test('pdfFilename creates a stable branded PDF filename', () => {
  const date = new Date(2026, 7, 29, 12, 0, 0);
  assert.equal(
    pdfFilename('TripCost', 'Bohol / 4 days', date),
    'UtiliCrate-TripCost-Bohol-4-days-2026-08-29.pdf',
  );
});
