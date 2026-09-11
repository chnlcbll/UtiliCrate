import { BadgePercent, CakeSlice, CalendarDays, CalendarRange, CaseSensitive, CircleDollarSign, Dices, Focus, Fuel, HeartPulse, History, ListChecks, ListFilter, ListTodo, Luggage, Omega, Palette, Percent, PiggyBank, Plane, Receipt, Scale, Split, Timer } from 'lucide-react';

const icons = {
  ambag: Split,
  allowance: CircleDollarSign,
  tipid: BadgePercent,
  'unit-price': Scale,
  'receipt-split': Receipt,
  percentage: Percent,
  decide: ListChecks,
  'pick-for-me': Dices,
  'text-fix': CaseSensitive,
  'list-cleaner': ListFilter,
  'how-long': CalendarRange,
  'time-ago': History,
  'age-calculator': CakeSlice,
  pack: Luggage,
  'save-up': PiggyBank,
  until: Timer,
  'week-no': CalendarDays,
  'focus-room': Focus,
  glyphs: Omega,
  swatch: Palette,
  'body-index': HeartPulse,
  'trip-cost': Plane,
  'fuel-cost': Fuel,
  prioritize: ListTodo,
  'weigh-it': Scale,
};

export function ToolIcon({ slug, size = 20, strokeWidth = 1.7 }: { slug: string; size?: number; strokeWidth?: number }) {
  const Icon = icons[slug as keyof typeof icons] ?? Receipt;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
