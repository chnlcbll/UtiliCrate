'use client';

import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { SiteNav } from '@/components/site-nav';
import { ToolIcon } from '@/components/tool-icon';
import { categories, tools, type ToolMeta } from '@/data/tools';
import { readLocal, storageKeys, writeLocal } from '@/lib/storage';
import { usePreferences } from '@/components/preferences-provider';

const bySlug = (slug: string) => tools.find((tool) => tool.slug === slug)!;
const categoryNotes: Record<string, string> = {
  Money: 'Know where every peso goes.',
  Decisions: 'Less circling. More choosing.',
  'Text & Lists': 'Turn messy input into something useful.',
  'Date & Time': 'Make time a little easier to understand.',
  Planning: 'Pack what matters. Leave the rest.',
  Focus: 'Give one thing your full attention.',
  Creative: 'Pull useful color from an image.',
  Health: 'Useful context, carefully presented.',
};

function OverflowSlider({ targetRef, label }: { targetRef: RefObject<HTMLDivElement | null>; label: string }) {
  const [maximum, setMaximum] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const updateBounds = () => {
      const nextMaximum = Math.max(0, target.scrollWidth - target.clientWidth);
      setMaximum(nextMaximum);
      setPosition(Math.min(target.scrollLeft, nextMaximum));
    };
    const updatePosition = () => setPosition(target.scrollLeft);
    const observer = new ResizeObserver(updateBounds);
    observer.observe(target);
    Array.from(target.children).forEach((child) => observer.observe(child));
    target.addEventListener('scroll', updatePosition, { passive: true });
    updateBounds();
    return () => {
      observer.disconnect();
      target.removeEventListener('scroll', updatePosition);
    };
  }, [targetRef]);

  if (maximum < 2) return null;
  return <label className="overflow-slider"><span>{label}</span><input type="range" min="0" max={maximum} value={Math.min(position, maximum)} onChange={(event) => { const next = Number(event.target.value); setPosition(next); targetRef.current?.scrollTo({ left: next, behavior: 'auto' }); }} /></label>;
}

export function HomeClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const categoryRailRef = useRef<HTMLDivElement>(null);
  const recentRailRef = useRef<HTMLDivElement>(null);
  const { dashboardMode, playSound } = usePreferences();

  // Client-only hydration is required because browser storage is unavailable during SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFavorites(readLocal(storageKeys.favorites, [])); setRecent(readLocal(storageKeys.recent, [])); }, []);
  useEffect(() => {
    if (dashboardMode === 'simple') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('revealed')); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold: .12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [dashboardMode]);

  const visible = useMemo(() => tools.filter((tool) => {
    const haystack = `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase();
    return (category === 'All' || tool.category === category) && haystack.includes(query.toLowerCase());
  }), [category, query]);
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.slug));
  const recentTools = recent.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean) as ToolMeta[];
  const toggleFavorite = (slug: string) => {
    const adding = !favorites.includes(slug);
    const next = adding ? [...favorites, slug] : favorites.filter((item) => item !== slug);
    setFavorites(next); writeLocal(storageKeys.favorites, next);
    playSound(adding ? 'success' : 'tap');
  };

  const directoryCard = (tool: ToolMeta) => <article className="directory-card" key={tool.slug}>
    <a href={`/${tool.slug}`}><span className="directory-icon"><ToolIcon slug={tool.slug} /></span><span><strong>{tool.name}</strong><small>{tool.description}</small></span><ArrowUpRight size={17} /></a>
    <button className={favorites.includes(tool.slug) ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(tool.slug)} aria-label={`${favorites.includes(tool.slug) ? 'Remove' : 'Add'} ${tool.name} ${favorites.includes(tool.slug) ? 'from' : 'to'} favorites`}><Star size={16} fill={favorites.includes(tool.slug) ? 'currentColor' : 'none'} /></button>
  </article>;

  const simpleGroups = categories.filter((item) => item !== 'All').map((item) => ({ name: item, tools: visible.filter((tool) => tool.category === item) })).filter((group) => group.tools.length);

  if (dashboardMode === 'simple') return <main className="home home-simple">
    <SiteNav />
    <section className="simple-dashboard wrap" id="top">
      <header className="simple-intro">
        <p className="eyebrow">Quick tool directory</p>
        <h1>What do you need?</h1>
        <p>Search the full crate or browse by category.</p>
      </header>
      <label className="simple-search"><Search size={21} /><input id="simple-tool-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools, tasks, or needs" aria-label="Search all tools" /><kbd>/</kbd></label>
      <div className="category-row simple-filters" ref={categoryRailRef} aria-label="Filter by category">{categories.map((item) => <button key={item} className={item === category ? 'chip active' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <OverflowSlider targetRef={categoryRailRef} label="Scroll categories" />

      {favoriteTools.length > 0 && !query && category === 'All' && <section className="simple-personal" id="favorites"><div className="simple-section-title"><h2>Favorites</h2><span>{favoriteTools.length}</span></div><div className="simple-tool-grid">{favoriteTools.map(directoryCard)}</div></section>}
      {recentTools.length > 0 && !query && category === 'All' && <section className="simple-recent"><div className="simple-section-title"><h2>Recently used</h2></div><div className="simple-recent-row" ref={recentRailRef}>{recentTools.map((tool) => <a key={tool.slug} href={`/${tool.slug}`}><ToolIcon slug={tool.slug} size={17} /><span>{tool.name}</span><ArrowUpRight size={15} /></a>)}</div><OverflowSlider targetRef={recentRailRef} label="Scroll recently used tools" /></section>}

      <section className="simple-directory" id="all-tools">
        <div className="simple-directory-heading"><div><span>All tools</span><h2>{query ? `Results for “${query}”` : category === 'All' ? 'Everything, within reach.' : category}</h2></div><span>{visible.length} {visible.length === 1 ? 'tool' : 'tools'}</span></div>
        {simpleGroups.length ? <div className="simple-groups">{simpleGroups.map((group) => <section className="simple-group" key={group.name}><header><h3>{group.name}</h3><span>{group.tools.length}</span></header><div className="simple-tool-grid">{group.tools.map(directoryCard)}</div></section>)}</div> : <div className="empty-state"><strong>No tools found</strong><span>Try a different search or category.</span></div>}
      </section>
    </section>
    <footer className="site-footer simple-footer"><div className="wrap"><span className="footer-wordmark"><b>Utili</b><i>Crate</i></span><p>Useful things, kept together.</p><a href="/about">About <ArrowUpRight size={15} /></a></div></footer>
  </main>;

  return <main className="home home-standard" id="top">
    <SiteNav />
    <section className="hero editorial-hero wrap" data-reveal>
      <p className="eyebrow">A tool for almost everything</p>
      <h1>For everything<br /><span>in between.</span></h1>
      <div className="hero-bottom"><p className="hero-copy">Quick tools for money, decisions, text, dates, planning, and everyday life.</p><div className="hero-actions"><button className="hero-search" onClick={() => document.querySelector<HTMLButtonElement>('.search-trigger')?.click()}><Search size={17} /> Search the crate</button><a className="view-all-tools" href="#all-tools">View All Tools <ArrowDown size={16} /></a></div></div>
      <a href="#featured" className="scroll-cue" aria-label="Explore featured tools"><ArrowDown size={17} /> Explore</a>
    </section>

    <section className="featured-section wrap" id="featured" data-reveal>
      <div className="section-intro"><span>Start here</span><h2>The useful things,<br /><i>ready when you are.</i></h2></div>
      <div className="editorial-grid">
        <a href="/ambag" className="feature-card feature-primary"><span className="feature-index">01 / Money</span><ToolIcon slug="ambag" size={34} /><div><h3>Ambag</h3><p>Split the bill without doing mental math.</p></div><ArrowUpRight size={22} /></a>
        {[bySlug('percentage'), bySlug('age-calculator'), bySlug('pick-for-me'), bySlug('text-fix')].map((tool, index) => <a href={`/${tool.slug}`} className={`feature-card feature-small feature-${index + 2}`} key={tool.slug}><span className="feature-index">0{index + 2}</span><ToolIcon slug={tool.slug} size={24} /><div><h3>{tool.name}</h3><p>{tool.description}</p></div><ArrowUpRight size={18} /></a>)}
      </div>
    </section>

    <section className="category-stories" id="categories">
      <div className="money-story wrap" data-reveal><div className="story-heading"><span>Money</span><h2>Make the numbers<br /><i>make sense.</i></h2><p>{categoryNotes.Money}</p></div><div className="money-tools">{tools.filter((tool) => tool.category === 'Money').slice(0, 6).map((tool, index) => <a href={`/${tool.slug}`} key={tool.slug} className={index === 0 ? 'money-tool featured' : 'money-tool'}><span>{String(index + 1).padStart(2, '0')}</span><ToolIcon slug={tool.slug} size={index === 0 ? 30 : 20} /><div><strong>{tool.name}</strong><small>{tool.description}</small></div><ArrowUpRight size={18} /></a>)}</div></div>
      <div className="decision-story" data-reveal><div className="wrap decision-inner"><div><span className="story-kicker">Decisions</span><h2>Choose with<br /><i>less noise.</i></h2><p>{categoryNotes.Decisions}</p></div><div className="decision-links">{tools.filter((tool) => tool.category === 'Decisions').map((tool) => <a href={`/${tool.slug}`} key={tool.slug}><ToolIcon slug={tool.slug} size={28} /><span><strong>{tool.name}</strong><small>{tool.description}</small></span><ArrowRight size={20} /></a>)}</div></div></div>
      <div className="text-story wrap" data-reveal><div className="story-heading"><span>Text & Lists</span><h2>From rough input<br />to <i>clean output.</i></h2><p>{categoryNotes['Text & Lists']}</p></div><div className="text-tools">{tools.filter((tool) => tool.category === 'Text & Lists').slice(0, 2).map((tool) => <a href={`/${tool.slug}`} key={tool.slug}><div className="text-sample">{tool.slug === 'text-fix' ? <><s>Too   many     spaces</s><strong>Too many spaces.</strong></> : <><s>apple · apple · mango</s><strong>apple · mango</strong></>}</div><span><ToolIcon slug={tool.slug} /><b>{tool.name}</b><ArrowUpRight size={18} /></span></a>)}</div></div>
      <div className="date-story wrap" data-reveal><div className="date-display"><span>365</span><small>days can feel<br />very different.</small></div><div className="date-copy"><span className="story-kicker">Date & Time</span><h2>Put time<br /><i>in perspective.</i></h2><p>{categoryNotes['Date & Time']}</p><div>{tools.filter((tool) => tool.category === 'Date & Time').map((tool) => <a href={`/${tool.slug}`} key={tool.slug}>{tool.name}<ArrowUpRight size={16} /></a>)}</div></div></div>
      <div className="planning-story wrap" data-reveal><a href="/pack"><div><span className="story-kicker">Planning</span><h2>Pack smarter.<br /><i>Travel lighter.</i></h2><p>{categoryNotes.Planning}</p></div><div className="packing-list" aria-hidden="true"><span><i>✓</i> Passport</span><span><i>✓</i> Phone charger</span><span><i>○</i> One less “just in case”</span></div><ArrowUpRight size={25} /></a></div>
    </section>

    <section className="directory-section wrap" id="all-tools" data-reveal>
      <div className="directory-heading"><div><span>All tools</span><h2>Open the crate.</h2></div><p>{tools.length} focused utilities, organized for quick access.</p></div>
      <label className="directory-search"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or need" aria-label="Search tool directory" /><kbd>/</kbd></label>
      <div className="category-row" aria-label="Filter by category">{categories.map((item) => <button key={item} className={item === category ? 'chip active' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {favoriteTools.length > 0 && !query && category === 'All' && <div className="personal-section" id="favorites"><div className="section-heading"><h3>Favorites</h3><span>{favoriteTools.length}</span></div><div className="directory-grid">{favoriteTools.map(directoryCard)}</div></div>}
      {recentTools.length > 0 && !query && category === 'All' && <div className="recent-strip"><span>Recently used</span>{recentTools.map((tool) => <a key={tool.slug} href={`/${tool.slug}`}><ToolIcon slug={tool.slug} size={16} />{tool.name}</a>)}</div>}
      <div className="section-heading"><h3>{category === 'All' ? 'The full collection' : category}</h3><span>{visible.length} {visible.length === 1 ? 'tool' : 'tools'}</span></div>
      {visible.length ? <div className="directory-grid">{visible.map(directoryCard)}</div> : <div className="empty-state"><strong>No tools found</strong><span>Try a different search or category.</span></div>}
      <a href="#top" className="back-to-top">Back to top <ArrowUp size={15} /></a>
    </section>

    <footer className="site-footer"><div className="wrap"><span className="footer-wordmark"><b>Utili</b><i>Crate</i></span><p>Useful things, kept together.</p><a href="/about">About UtiliCrate <ArrowUpRight size={15} /></a></div></footer>
  </main>;
}
