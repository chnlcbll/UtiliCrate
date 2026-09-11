const PREFIX = 'toolio:v1:';

export const storageKeys = {
  favorites: 'favorites',
  recent: 'recent',
  currency: 'currency',
  preferences: 'preferences',
  ambag: 'ambag',
  allowance: 'allowance',
  tipid: 'tipid',
  decide: 'decide',
  pack: 'pack',
  receipt: 'receipt',
  saveUp: 'save-up',
  until: 'until',
  focusRoom: 'focus-room',
  glyphs: 'glyphs',
  swatch: 'swatch',
  tripCost: 'trip-cost',
  fuelCost: 'fuel-cost',
  prioritize: 'prioritize',
  weighIt: 'weigh-it',
} as const;

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { version?: number; value?: T } | T;
    if (typeof parsed === 'object' && parsed !== null && 'value' in parsed) {
      return (parsed as { value: T }).value;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify({ version: 1, value }));
  } catch { /* Storage can be unavailable in private browsing. */ }
}

export function clearUtiliCrateData() {
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage).filter((key) => key.startsWith(PREFIX)).forEach((key) => window.localStorage.removeItem(key));
}

export function rememberRecent(slug: string) {
  const recent = readLocal<string[]>(storageKeys.recent, []);
  writeLocal(storageKeys.recent, [slug, ...recent.filter((item) => item !== slug)].slice(0, 5));
}
