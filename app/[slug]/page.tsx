import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolShell } from '@/components/tool-shell';
import { toolBySlug, tools } from '@/data/tools';
import { PercentageTool, UnitPriceTool, HowLongTool, TimeAgoTool, AgeCalcTool } from '@/components/tools/calculator-tools';
import { TextFixTool, ListCleanerTool } from '@/components/tools/text-tools';
import { AmbagTool, AllowanceTool, TipidTool, ReceiptSplitTool } from '@/components/tools/money-tools';
import { DecideTool, PickForMeTool } from '@/components/tools/decision-tools';
import { PackTool } from '@/components/tools/pack-tool';

const components: Record<string, React.ComponentType> = {
  percentage: PercentageTool, 'unit-price': UnitPriceTool, 'how-long': HowLongTool, 'time-ago': TimeAgoTool, 'age-calculator': AgeCalcTool,
  'text-fix': TextFixTool, 'list-cleaner': ListCleanerTool, ambag: AmbagTool, allowance: AllowanceTool, tipid: TipidTool, 'receipt-split': ReceiptSplitTool,
  decide: DecideTool, 'pick-for-me': PickForMeTool, pack: PackTool,
};

export function generateStaticParams() { return tools.map((tool) => ({ slug: tool.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = toolBySlug((await params).slug); if (!tool) return {};
  return { title: `${tool.name} — Toolio`, description: tool.description, openGraph: { title: `${tool.name} — Toolio`, description: tool.description }, twitter: { card: 'summary_large_image', title: `${tool.name} — Toolio`, description: tool.description } };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug; const tool = toolBySlug(slug); const Component = components[slug];
  if (!tool || !Component) notFound();
  return <ToolShell tool={tool}><Component /></ToolShell>;
}
