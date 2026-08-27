export type ToolCategory = 'Money' | 'Decisions' | 'Text & Lists' | 'Date & Time' | 'Planning';

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
  { slug: 'decide', name: 'Decide', description: 'Score your options using what matters.', category: 'Decisions', icon: '✓', keywords: ['decision', 'weighted', 'score', 'choice'] },
  { slug: 'pick-for-me', name: 'PickForMe', description: 'Pick a winner, shuffle a list, roll a die.', category: 'Decisions', icon: '?', keywords: ['random', 'picker', 'coin', 'dice', 'teams'] },
  { slug: 'text-fix', name: 'TextFix', description: 'Clean, format, and transform text locally.', category: 'Text & Lists', icon: 'Aa', keywords: ['text', 'case', 'spaces', 'format'] },
  { slug: 'list-cleaner', name: 'ListCleaner', description: 'Sort, deduplicate, and tidy any list.', category: 'Text & Lists', icon: '≡', keywords: ['list', 'duplicate', 'sort', 'lines'] },
  { slug: 'how-long', name: 'HowLong', description: 'Find the exact time between two dates.', category: 'Date & Time', icon: '↔', keywords: ['date', 'duration', 'days', 'time'] },
  { slug: 'time-ago', name: 'TimeAgo', description: 'Turn a date into a human-friendly time.', category: 'Date & Time', icon: '⌛', keywords: ['date', 'past', 'future', 'relative'] },
  { slug: 'age-calculator', name: 'AgeCalc', description: 'Calculate an exact age and next birthday.', category: 'Date & Time', icon: '○', keywords: ['date', 'birthday', 'age', 'born'] },
  { slug: 'pack', name: 'Pack', description: 'Build a practical packing checklist.', category: 'Planning', icon: '□', keywords: ['packing', 'trip', 'travel', 'checklist'] },
];

export const toolBySlug = (slug: string) => tools.find((tool) => tool.slug === slug);
export const categories = ['All', 'Money', 'Decisions', 'Text & Lists', 'Date & Time', 'Planning'] as const;
