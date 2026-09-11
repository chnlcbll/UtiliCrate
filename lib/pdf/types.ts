export type PdfMetric = { label: string; value: string; detail?: string };
export type PdfRow = { label: string; value: string; detail?: string };
export type PdfBar = { label: string; value: number; display?: string };
export type PdfTableColumn = { key: string; label: string; width?: number; align?: 'left' | 'right' };

export type PdfSection =
  | { kind: 'metrics'; title?: string; items: PdfMetric[] }
  | { kind: 'rows'; title: string; rows: PdfRow[] }
  | { kind: 'table'; title: string; columns: PdfTableColumn[]; rows: Record<string, string | number>[] }
  | { kind: 'bars'; title: string; items: PdfBar[]; note?: string }
  | { kind: 'progress'; title: string; value: number; label: string; start?: string; end?: string }
  | { kind: 'timeline'; title: string; start: string; end: string; marker?: number; markerLabel?: string }
  | { kind: 'checklist'; title: string; groups: { title: string; items: { label: string; checked?: boolean; quantity?: number }[] }[] }
  | { kind: 'matrix'; title: string; quadrants: { title: string; subtitle?: string; items: string[] }[] }
  | { kind: 'palette'; title: string; colors: { hex: string; rgb?: string; hsl?: string }[] }
  | { kind: 'calendar'; title: string; days: { weekday: string; day: string; detail?: string }[] }
  | { kind: 'text'; title?: string; body: string; monospace?: boolean }
  | { kind: 'image'; title?: string; dataUrl: string; caption?: string };

export type PdfReport = {
  tool: string;
  title: string;
  subtitle?: string;
  accent: string;
  filenameDetail?: string;
  hero?: { label: string; value: string; detail?: string };
  summary?: string;
  sections: PdfSection[];
  disclaimer?: string;
  generatedAt?: Date;
};
