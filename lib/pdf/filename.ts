export function safeFilenamePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'Report';
}

export function pdfFilename(tool: string, detail?: string, date = new Date()) {
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  return ['UtiliCrate', safeFilenamePart(tool), detail ? safeFilenamePart(detail) : '', day].filter(Boolean).join('-') + '.pdf';
}
