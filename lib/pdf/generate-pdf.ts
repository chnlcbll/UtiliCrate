'use client';

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFPage, PDFFont, rgb } from 'pdf-lib';
import { pdfFilename } from '@/lib/pdf/filename';
import type { PdfReport, PdfSection, PdfTableColumn } from '@/lib/pdf/types';

const PAGE = { width: 595.28, height: 841.89, margin: 46 };
const geistFontUrl = '/fonts/Geist-Regular.ttf';

type Color = ReturnType<typeof rgb>;
type State = { doc: PDFDocument; page: PDFPage; font: PDFFont; serif: PDFFont; accent: Color; y: number; report: PdfReport };

const clean = (value: unknown) => String(value ?? '').replace(/[\u2011\u2013\u2014]/g, '-').replace(/\r/g, '');
const hex = (value: string) => {
  const normalized = value.replace('#', '').padEnd(6, '0').slice(0, 6);
  return rgb(parseInt(normalized.slice(0, 2), 16) / 255, parseInt(normalized.slice(2, 4), 16) / 255, parseInt(normalized.slice(4, 6), 16) / 255);
};
const ink = rgb(.075, .095, .083);
const muted = rgb(.39, .43, .40);
const line = rgb(.83, .85, .82);
const paper = rgb(.985, .982, .965);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const paragraphs = clean(text).split('\n');
  const lines: string[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = '';
    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width || !current) current = candidate;
      else { lines.push(current); current = word; }
    });
    if (current) lines.push(current);
    if (!words.length || paragraphIndex < paragraphs.length - 1) lines.push('');
  });
  return lines;
}

function drawFooter(state: State, page: PDFPage, index: number, count: number) {
  page.drawLine({ start: { x: PAGE.margin, y: 30 }, end: { x: PAGE.width - PAGE.margin, y: 30 }, thickness: .6, color: line });
  page.drawText('Generated with UtiliCrate', { x: PAGE.margin, y: 16, size: 7.5, font: state.font, color: muted });
  const stamp = (state.report.generatedAt ?? new Date()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const right = `${stamp}  |  ${index + 1} / ${count}`;
  page.drawText(right, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(right, 7.5), y: 16, size: 7.5, font: state.font, color: muted });
}

function newPage(state: State) {
  state.page = state.doc.addPage([PAGE.width, PAGE.height]);
  state.page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: paper });
  state.page.drawText('UTILICRATE', { x: PAGE.margin, y: 805, size: 9, font: state.font, color: state.accent, characterSpacing: 1.4 });
  const tool = clean(state.report.tool).toUpperCase();
  state.page.drawText(tool, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(tool, 8), y: 805, size: 8, font: state.font, color: muted });
  state.page.drawLine({ start: { x: PAGE.margin, y: 794 }, end: { x: PAGE.width - PAGE.margin, y: 794 }, thickness: .7, color: line });
  state.y = 766;
}

function ensure(state: State, height: number) {
  if (state.y - height < 48) newPage(state);
}

function paragraph(state: State, text: string, options?: { size?: number; color?: Color; width?: number; lineHeight?: number; font?: PDFFont }) {
  const size = options?.size ?? 10;
  const font = options?.font ?? state.font;
  const width = options?.width ?? PAGE.width - PAGE.margin * 2;
  const lineHeight = options?.lineHeight ?? size * 1.45;
  const lines = wrap(text, font, size, width);
  ensure(state, Math.max(lineHeight, lines.length * lineHeight));
  lines.forEach((item) => { if (item) state.page.drawText(item, { x: PAGE.margin, y: state.y, size, font, color: options?.color ?? ink }); state.y -= lineHeight; });
}

function sectionTitle(state: State, title: string) {
  ensure(state, 42);
  state.y -= 10;
  state.page.drawText(clean(title).toUpperCase(), { x: PAGE.margin, y: state.y, size: 8, font: state.font, color: state.accent, characterSpacing: 1 });
  state.y -= 12;
  state.page.drawLine({ start: { x: PAGE.margin, y: state.y }, end: { x: PAGE.width - PAGE.margin, y: state.y }, thickness: .7, color: line });
  state.y -= 17;
}

function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  let value = clean(text);
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
  while (value.length > 1 && font.widthOfTextAtSize(`${value}...`, size) > maxWidth) value = value.slice(0, -1);
  return `${value}...`;
}

function drawTableHeader(state: State, columns: PdfTableColumn[], widths: number[]) {
  state.page.drawRectangle({ x: PAGE.margin, y: state.y - 19, width: PAGE.width - PAGE.margin * 2, height: 24, color: rgb(.93, .94, .92) });
  let x = PAGE.margin + 7;
  columns.forEach((column, index) => {
    state.page.drawText(clean(column.label).toUpperCase(), { x, y: state.y - 10, size: 6.8, font: state.font, color: muted, characterSpacing: .45 });
    x += widths[index];
  });
  state.y -= 25;
}

async function drawSection(state: State, section: PdfSection) {
  if (section.kind === 'metrics') {
    if (section.title) sectionTitle(state, section.title);
    const columns = section.items.length === 1 ? 1 : 2;
    const width = (PAGE.width - PAGE.margin * 2 - 10) / columns;
    for (let index = 0; index < section.items.length; index += columns) {
      ensure(state, 82);
      section.items.slice(index, index + columns).forEach((item, offset) => {
        const x = PAGE.margin + offset * (width + 10);
        state.page.drawRectangle({ x, y: state.y - 61, width, height: 66, borderColor: line, borderWidth: .7, color: rgb(.972, .97, .95) });
        state.page.drawText(clean(item.label).toUpperCase(), { x: x + 12, y: state.y - 14, size: 6.8, font: state.font, color: muted, characterSpacing: .5 });
        state.page.drawText(fit(item.value, state.font, 17, width - 24), { x: x + 12, y: state.y - 37, size: 17, font: state.font, color: ink });
        if (item.detail) state.page.drawText(fit(item.detail, state.font, 7.5, width - 24), { x: x + 12, y: state.y - 52, size: 7.5, font: state.font, color: muted });
      });
      state.y -= 76;
    }
  } else if (section.kind === 'rows') {
    sectionTitle(state, section.title);
    section.rows.forEach((row) => {
      ensure(state, row.detail ? 47 : 34);
      state.page.drawText(fit(row.label, state.font, 9, 310), { x: PAGE.margin, y: state.y, size: 9, font: state.font, color: ink });
      const value = fit(row.value, state.font, 10, 165);
      state.page.drawText(value, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(value, 10), y: state.y, size: 10, font: state.font, color: ink });
      if (row.detail) { state.y -= 13; paragraph(state, row.detail, { size: 7.5, color: muted, width: 430, lineHeight: 10 }); }
      state.y -= 11;
      state.page.drawLine({ start: { x: PAGE.margin, y: state.y }, end: { x: PAGE.width - PAGE.margin, y: state.y }, thickness: .45, color: line });
      state.y -= 14;
    });
  } else if (section.kind === 'table') {
    sectionTitle(state, section.title);
    const available = PAGE.width - PAGE.margin * 2;
    const fixed = section.columns.reduce((sum, column) => sum + (column.width ?? 0), 0);
    const flexible = section.columns.filter((column) => !column.width).length || 1;
    const widths = section.columns.map((column) => column.width ?? (available - fixed) / flexible);
    drawTableHeader(state, section.columns, widths);
    section.rows.forEach((row) => {
      if (state.y - 25 < 48) { newPage(state); sectionTitle(state, `${section.title} - continued`); drawTableHeader(state, section.columns, widths); }
      let x = PAGE.margin + 7;
      section.columns.forEach((column, index) => {
        const text = fit(row[column.key], state.font, 7.8, widths[index] - 12);
        const textWidth = state.font.widthOfTextAtSize(text, 7.8);
        state.page.drawText(text, { x: column.align === 'right' ? x + widths[index] - 12 - textWidth : x, y: state.y - 8, size: 7.8, font: state.font, color: ink });
        x += widths[index];
      });
      state.y -= 24;
      state.page.drawLine({ start: { x: PAGE.margin, y: state.y }, end: { x: PAGE.width - PAGE.margin, y: state.y }, thickness: .35, color: line });
    });
    state.y -= 8;
  } else if (section.kind === 'bars') {
    sectionTitle(state, section.title);
    const max = Math.max(1, ...section.items.map((item) => item.value));
    section.items.forEach((item) => {
      ensure(state, 43);
      state.page.drawText(fit(item.label, state.font, 8.5, 180), { x: PAGE.margin, y: state.y, size: 8.5, font: state.font, color: ink });
      const display = item.display ?? String(item.value);
      state.page.drawText(display, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(display, 8.5), y: state.y, size: 8.5, font: state.font, color: ink });
      state.y -= 14;
      state.page.drawRectangle({ x: PAGE.margin, y: state.y - 7, width: PAGE.width - PAGE.margin * 2, height: 8, color: rgb(.9, .91, .89) });
      state.page.drawRectangle({ x: PAGE.margin, y: state.y - 7, width: (PAGE.width - PAGE.margin * 2) * Math.max(0, item.value) / max, height: 8, color: state.accent });
      state.y -= 24;
    });
    if (section.note) paragraph(state, section.note, { size: 7.7, color: muted });
  } else if (section.kind === 'progress') {
    sectionTitle(state, section.title);
    ensure(state, 73);
    const value = Math.max(0, Math.min(100, section.value));
    state.page.drawText(section.label, { x: PAGE.margin, y: state.y, size: 19, font: state.font, color: ink });
    const pct = `${Math.round(value)}%`;
    state.page.drawText(pct, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(pct, 19), y: state.y, size: 19, font: state.font, color: state.accent });
    state.y -= 25;
    state.page.drawRectangle({ x: PAGE.margin, y: state.y, width: PAGE.width - PAGE.margin * 2, height: 12, color: rgb(.89, .91, .88) });
    state.page.drawRectangle({ x: PAGE.margin, y: state.y, width: (PAGE.width - PAGE.margin * 2) * value / 100, height: 12, color: state.accent });
    state.y -= 17;
    if (section.start) state.page.drawText(section.start, { x: PAGE.margin, y: state.y, size: 7.5, font: state.font, color: muted });
    if (section.end) state.page.drawText(section.end, { x: PAGE.width - PAGE.margin - state.font.widthOfTextAtSize(section.end, 7.5), y: state.y, size: 7.5, font: state.font, color: muted });
    state.y -= 18;
  } else if (section.kind === 'timeline') {
    sectionTitle(state, section.title);
    ensure(state, 65);
    const left = PAGE.margin + 7, right = PAGE.width - PAGE.margin - 7;
    state.page.drawLine({ start: { x: left, y: state.y - 18 }, end: { x: right, y: state.y - 18 }, thickness: 2, color: state.accent });
    [left, right].forEach((x) => state.page.drawCircle({ x, y: state.y - 18, size: 4, color: paper, borderColor: state.accent, borderWidth: 2 }));
    if (section.marker !== undefined) { const x = left + (right - left) * Math.max(0, Math.min(1, section.marker)); state.page.drawCircle({ x, y: state.y - 18, size: 5, color: state.accent }); if (section.markerLabel) state.page.drawText(section.markerLabel, { x: Math.min(x + 7, right - 80), y: state.y - 4, size: 7, font: state.font, color: state.accent }); }
    state.page.drawText(fit(section.start, state.font, 8, 190), { x: left, y: state.y - 37, size: 8, font: state.font, color: ink });
    const end = fit(section.end, state.font, 8, 190);
    state.page.drawText(end, { x: right - state.font.widthOfTextAtSize(end, 8), y: state.y - 37, size: 8, font: state.font, color: ink });
    state.y -= 61;
  } else if (section.kind === 'checklist') {
    sectionTitle(state, section.title);
    section.groups.forEach((group) => {
      ensure(state, 32);
      state.page.drawText(clean(group.title), { x: PAGE.margin, y: state.y, size: 12, font: state.font, color: ink });
      state.y -= 18;
      group.items.forEach((item) => {
        ensure(state, 22);
        state.page.drawRectangle({ x: PAGE.margin, y: state.y - 1, width: 9, height: 9, borderColor: item.checked ? state.accent : muted, borderWidth: .8, color: item.checked ? state.accent : paper });
        if (item.checked) { state.page.drawLine({ start: { x: PAGE.margin + 2, y: state.y + 3 }, end: { x: PAGE.margin + 4, y: state.y + 1 }, thickness: 1, color: paper }); state.page.drawLine({ start: { x: PAGE.margin + 4, y: state.y + 1 }, end: { x: PAGE.margin + 8, y: state.y + 7 }, thickness: 1, color: paper }); }
        const quantity = item.quantity && item.quantity > 1 ? ` x ${item.quantity}` : '';
        state.page.drawText(fit(`${item.label}${quantity}`, state.font, 8.8, 460), { x: PAGE.margin + 17, y: state.y, size: 8.8, font: state.font, color: item.checked ? muted : ink });
        state.y -= 19;
      });
      state.y -= 8;
    });
  } else if (section.kind === 'matrix') {
    sectionTitle(state, section.title);
    ensure(state, 330);
    const gap = 7, width = (PAGE.width - PAGE.margin * 2 - gap) / 2, height = 145;
    const overflow: { title: string; items: string[] }[] = [];
    section.quadrants.slice(0, 4).forEach((quadrant, index) => {
      const col = index % 2, row = Math.floor(index / 2), x = PAGE.margin + col * (width + gap), top = state.y - row * (height + gap);
      state.page.drawRectangle({ x, y: top - height, width, height, borderColor: line, borderWidth: .7, color: rgb(.97, .97, .95) });
      state.page.drawRectangle({ x, y: top - 27, width, height: 27, color: index === 0 ? state.accent : rgb(.9, .91, .89) });
      state.page.drawText(clean(quadrant.title).toUpperCase(), { x: x + 10, y: top - 17, size: 8, font: state.font, color: index === 0 ? paper : ink, characterSpacing: .6 });
      if (quadrant.subtitle) state.page.drawText(fit(quadrant.subtitle, state.font, 6.5, width - 20), { x: x + 10, y: top - 39, size: 6.5, font: state.font, color: muted });
      quadrant.items.slice(0, 5).forEach((item, itemIndex) => state.page.drawText(fit(`- ${item}`, state.font, 7.5, width - 20), { x: x + 10, y: top - 56 - itemIndex * 16, size: 7.5, font: state.font, color: ink }));
      if (quadrant.items.length > 5) overflow.push({ title: quadrant.title, items: quadrant.items.slice(5) });
    });
    state.y -= height * 2 + gap + 17;
    overflow.forEach((group) => drawSection(state, { kind: 'rows', title: `${group.title} - continued`, rows: group.items.map((item, index) => ({ label: `${index + 6}. ${item}`, value: '' })) }));
  } else if (section.kind === 'palette') {
    sectionTitle(state, section.title);
    section.colors.forEach((color) => {
      ensure(state, 58);
      state.page.drawRectangle({ x: PAGE.margin, y: state.y - 40, width: 112, height: 44, color: hex(color.hex) });
      state.page.drawText(color.hex.toUpperCase(), { x: PAGE.margin + 128, y: state.y - 13, size: 14, font: state.font, color: ink });
      const detail = [color.rgb, color.hsl].filter(Boolean).join('  |  ');
      if (detail) state.page.drawText(detail, { x: PAGE.margin + 128, y: state.y - 31, size: 7.5, font: state.font, color: muted });
      state.y -= 55;
    });
  } else if (section.kind === 'calendar') {
    sectionTitle(state, section.title);
    ensure(state, 95);
    const width = (PAGE.width - PAGE.margin * 2) / section.days.length;
    section.days.forEach((day, index) => {
      const x = PAGE.margin + width * index;
      state.page.drawRectangle({ x, y: state.y - 69, width, height: 74, borderColor: line, borderWidth: .5, color: index > 4 ? rgb(.95, .94, .91) : paper });
      state.page.drawText(day.weekday.toUpperCase(), { x: x + 7, y: state.y - 13, size: 6.3, font: state.font, color: muted, characterSpacing: .4 });
      state.page.drawText(day.day, { x: x + 7, y: state.y - 42, size: 20, font: state.serif, color: ink });
      if (day.detail) state.page.drawText(fit(day.detail, state.font, 5.5, width - 12), { x: x + 7, y: state.y - 59, size: 5.5, font: state.font, color: muted });
    });
    state.y -= 88;
  } else if (section.kind === 'text') {
    if (section.title) sectionTitle(state, section.title);
    paragraph(state, section.body, { size: section.monospace ? 8.5 : 10, lineHeight: section.monospace ? 12 : 15 });
    state.y -= 10;
  } else if (section.kind === 'image') {
    if (section.title) sectionTitle(state, section.title);
    const bytes = Uint8Array.from(atob(section.dataUrl.split(',')[1]), (char) => char.charCodeAt(0));
    const image = section.dataUrl.startsWith('data:image/png') ? await state.doc.embedPng(bytes) : await state.doc.embedJpg(bytes);
    const maxWidth = PAGE.width - PAGE.margin * 2, maxHeight = 270;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = image.width * scale, height = image.height * scale;
    ensure(state, height + 28);
    state.page.drawImage(image, { x: PAGE.margin + (maxWidth - width) / 2, y: state.y - height, width, height });
    state.y -= height + 10;
    if (section.caption) paragraph(state, section.caption, { size: 7.5, color: muted });
  }
}

export async function generatePdf(report: PdfReport) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontBytes = await fetch(geistFontUrl).then((response) => { if (!response.ok) throw new Error('Could not load the report font.'); return response.arrayBuffer(); });
  const font = await doc.embedFont(fontBytes, { subset: true });
  const serif = await doc.embedFont(fontBytes, { subset: true });
  doc.setTitle(`${report.tool} - ${report.title}`);
  doc.setAuthor('UtiliCrate');
  doc.setCreator('UtiliCrate local PDF export');
  doc.setSubject(report.subtitle || report.summary || `${report.tool} report`);
  doc.setKeywords(['UtiliCrate', report.tool, 'local report']);
  doc.setCreationDate(report.generatedAt ?? new Date());

  const state = { doc, page: doc.addPage([PAGE.width, PAGE.height]), font, serif, accent: hex(report.accent), y: 0, report };
  doc.removePage(0);
  newPage(state);

  state.page.drawText(clean(report.tool), { x: PAGE.margin, y: state.y, size: 13, font, color: state.accent });
  state.y -= 27;
  const titleLines = wrap(report.title, font, 29, PAGE.width - PAGE.margin * 2);
  titleLines.slice(0, 3).forEach((titleLine) => { state.page.drawText(titleLine, { x: PAGE.margin, y: state.y, size: 29, font, color: ink }); state.y -= 34; });
  if (report.subtitle) { paragraph(state, report.subtitle, { size: 10, color: muted, width: 470, lineHeight: 14 }); state.y -= 4; }

  if (report.hero) {
    ensure(state, 130);
    state.page.drawRectangle({ x: PAGE.margin, y: state.y - 103, width: PAGE.width - PAGE.margin * 2, height: 112, color: rgb(.945, .947, .925), borderColor: line, borderWidth: .6 });
    state.page.drawRectangle({ x: PAGE.margin, y: state.y - 103, width: 5, height: 112, color: state.accent });
    state.page.drawText(clean(report.hero.label).toUpperCase(), { x: PAGE.margin + 20, y: state.y - 19, size: 7.5, font, color: muted, characterSpacing: .8 });
    const heroValue = fit(report.hero.value, font, 38, PAGE.width - PAGE.margin * 2 - 40);
    state.page.drawText(heroValue, { x: PAGE.margin + 20, y: state.y - 62, size: 38, font, color: ink });
    if (report.hero.detail) state.page.drawText(fit(report.hero.detail, font, 9, PAGE.width - PAGE.margin * 2 - 40), { x: PAGE.margin + 20, y: state.y - 84, size: 9, font, color: muted });
    state.y -= 125;
  }
  if (report.summary) { paragraph(state, report.summary, { size: 9.5, color: muted, width: 480 }); state.y -= 8; }
  for (const section of report.sections) await drawSection(state, section);
  if (report.disclaimer) { sectionTitle(state, 'Important note'); paragraph(state, report.disclaimer, { size: 8, color: muted }); }

  const pages = doc.getPages();
  pages.forEach((page, index) => drawFooter(state, page, index, pages.length));
  const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  return { blob: new Blob([bytes], { type: 'application/pdf' }), filename: pdfFilename(report.tool, report.filenameDetail || report.title, report.generatedAt) };
}

export async function downloadPdfReport(report: PdfReport) {
  const { blob, filename } = await generatePdf(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  return filename;
}
