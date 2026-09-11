import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolShell } from '@/components/tool-shell';
import { toolBySlug, tools } from '@/data/tools';
import { PercentageTool, UnitPriceTool, HowLongTool, TimeAgoTool, AgeCalcTool } from '@/components/tools/calculator-tools';
import { TextFixTool, ListCleanerTool } from '@/components/tools/text-tools';
import { AmbagTool, AllowanceTool, TipidTool, ReceiptSplitTool } from '@/components/tools/money-tools';
import { DecideTool, PickForMeTool } from '@/components/tools/decision-tools';
import { PackTool } from '@/components/tools/pack-tool';
import { SaveUpTool, TripCostTool, FuelCostTool } from '@/components/tools/finance-tools';
import { UntilTool, WeekNoTool } from '@/components/tools/date-tools';
import { GlyphsTool, SwatchTool } from '@/components/tools/creative-tools';
import { BodyIndexTool } from '@/components/tools/health-tools';
import { PrioritizeTool, WeighItTool } from '@/components/tools/organization-tools';
import { FocusRoomTool } from '@/components/tools/focus-room';

const components: Record<string, React.ComponentType> = {
  percentage: PercentageTool, 'unit-price': UnitPriceTool, 'how-long': HowLongTool, 'time-ago': TimeAgoTool, 'age-calculator': AgeCalcTool,
  'text-fix': TextFixTool, 'list-cleaner': ListCleanerTool, ambag: AmbagTool, allowance: AllowanceTool, tipid: TipidTool, 'receipt-split': ReceiptSplitTool,
  decide: DecideTool, 'pick-for-me': PickForMeTool, pack: PackTool,
  'save-up': SaveUpTool, 'trip-cost': TripCostTool, 'fuel-cost': FuelCostTool,
  until: UntilTool, 'week-no': WeekNoTool, glyphs: GlyphsTool, swatch: SwatchTool,
  'body-index': BodyIndexTool, prioritize: PrioritizeTool, 'weigh-it': WeighItTool,
  'focus-room': FocusRoomTool,
};

export function generateStaticParams() { return tools.map((tool) => ({ slug: tool.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = toolBySlug((await params).slug); if (!tool) return {};
  return { title: `${tool.name} — UtiliCrate`, description: tool.description, openGraph: { title: `${tool.name} — UtiliCrate`, description: tool.description, images: [] }, twitter: { card: 'summary', title: `${tool.name} — UtiliCrate`, description: tool.description, images: [] } };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug; const tool = toolBySlug(slug); const Component = components[slug];
  if (!tool || !Component) notFound();
  if (slug === 'focus-room') return <Component />;
  return <ToolShell tool={tool}><Component /></ToolShell>;
}
