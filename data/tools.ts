export type ToolCategory = 'Money' | 'Decisions' | 'Text & Lists' | 'Date & Time' | 'Planning' | 'Focus' | 'Creative' | 'Health';

export type ToolMeta = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
};

export const tools: ToolMeta[] = [
  { slug: 'ambag', name: 'Ambag', description: 'Split bills fairly and quickly.', category: 'Money', icon: '÷', keywords: ['bill', 'split', 'people', 'share'] },
  { slug: 'allowance', name: 'Allowance', description: 'Make your money last until the next one.', category: 'Money', icon: '₱', keywords: ['budget', 'money', 'daily', 'spend'] },
  { slug: 'tipid', name: 'Tipid', description: 'Compare deals and find the real bargain.', category: 'Money', icon: '↓', keywords: ['price', 'deal', 'discount', 'promo', 'savings'] },
  { slug: 'unit-price', name: 'UnitPrice', description: 'Compare prices across sizes and units.', category: 'Money', icon: '≈', keywords: ['price', 'unit', 'cheaper', 'compare'] },
  { slug: 'receipt-split', name: 'ReceiptSplit', description: 'Split an itemized receipt precisely.', category: 'Money', icon: '≣', keywords: ['bill', 'receipt', 'items', 'split'] },
  { slug: 'percentage', name: 'Percentage', description: 'Calculate percentages every which way.', category: 'Money', icon: '%', keywords: ['percent', 'increase', 'decrease', 'calculator'] },
  { slug: 'save-up', name: 'SaveUp', description: 'Plan a savings goal and stay on pace.', category: 'Money', icon: '◎', keywords: ['savings', 'goal', 'money', 'contribution', 'fund'] },
  { slug: 'trip-cost', name: 'TripCost', description: 'Build a clear travel budget.', category: 'Money', icon: '✈', keywords: ['travel', 'trip', 'budget', 'cost', 'vacation'] },
  { slug: 'fuel-cost', name: 'FuelCost', description: 'Estimate fuel needs and trip cost.', category: 'Money', icon: '⛽', keywords: ['fuel', 'gas', 'distance', 'mileage', 'vehicle'] },
  { slug: 'decide', name: 'Decide', description: 'Score your options using what matters.', category: 'Decisions', icon: '✓', keywords: ['decision', 'weighted', 'score', 'choice'] },
  { slug: 'pick-for-me', name: 'PickForMe', description: 'Pick a winner, spin a wheel, shuffle a list.', category: 'Decisions', icon: '?', keywords: ['random', 'picker', 'wheel', 'coin', 'dice', 'teams'] },
  { slug: 'prioritize', name: 'Prioritize', description: 'Sort tasks by urgency and importance.', category: 'Decisions', icon: '▦', keywords: ['tasks', 'eisenhower', 'priority', 'matrix', 'urgent'] },
  { slug: 'weigh-it', name: 'WeighIt', description: 'Compare the weight of pros and cons.', category: 'Decisions', icon: '±', keywords: ['pros', 'cons', 'decision', 'compare', 'weighted'] },
  { slug: 'text-fix', name: 'TextFix', description: 'Clean, format, and transform text.', category: 'Text & Lists', icon: 'Aa', keywords: ['text', 'case', 'spaces', 'format'] },
  { slug: 'list-cleaner', name: 'ListCleaner', description: 'Sort, deduplicate, and tidy any list.', category: 'Text & Lists', icon: '≡', keywords: ['list', 'duplicate', 'sort', 'lines'] },
  { slug: 'glyphs', name: 'Glyphs', description: 'Find and copy useful characters and symbols.', category: 'Text & Lists', icon: 'Ω', keywords: ['unicode', 'symbol', 'character', 'arrow', 'currency', 'copy'] },
  { slug: 'how-long', name: 'HowLong', description: 'Find the exact time between two dates.', category: 'Date & Time', icon: '↔', keywords: ['date', 'duration', 'days', 'time'] },
  { slug: 'time-ago', name: 'TimeAgo', description: 'Turn a date into a human-friendly time.', category: 'Date & Time', icon: '⌛', keywords: ['date', 'past', 'future', 'relative'] },
  { slug: 'age-calculator', name: 'AgeCalc', description: 'Calculate an exact age and next birthday.', category: 'Date & Time', icon: '○', keywords: ['date', 'birthday', 'age', 'born'] },
  { slug: 'until', name: 'Until', description: 'Count down to what matters next.', category: 'Date & Time', icon: '◴', keywords: ['countdown', 'event', 'deadline', 'timer', 'date'] },
  { slug: 'week-no', name: 'WeekNo', description: 'Explore ISO weeks and calendar details.', category: 'Date & Time', icon: '#', keywords: ['week', 'iso', 'calendar', 'date', 'quarter'] },
  { slug: 'pack', name: 'Pack', description: 'Build a practical packing checklist.', category: 'Planning', icon: '□', keywords: ['packing', 'trip', 'travel', 'checklist'] },
  { slug: 'focus-room', name: 'FocusRoom', description: 'Enter a dedicated space for focused work.', category: 'Focus', icon: '◉', keywords: ['pomodoro', 'timer', 'focus', 'deep work', 'sprint'] },
  { slug: 'swatch', name: 'Swatch', description: 'Extract a color palette from any image.', category: 'Creative', icon: '◐', keywords: ['image', 'palette', 'color', 'hex', 'rgb'] },
  { slug: 'body-index', name: 'BodyIndex', description: 'Calculate BMI with age-appropriate context.', category: 'Health', icon: '◇', keywords: ['bmi', 'health', 'weight', 'height', 'age', 'adult', 'child', 'teen'] },
];

export const toolBySlug = (slug: string) => tools.find((tool) => tool.slug === slug);
export const categories = ['All', 'Money', 'Decisions', 'Text & Lists', 'Date & Time', 'Planning', 'Focus', 'Creative', 'Health'] as const;
