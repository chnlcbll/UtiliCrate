'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Brand } from '@/components/brand';
import { categories, tools } from '@/data/tools';
import { readLocal, storageKeys, writeLocal } from '@/lib/storage';

export function HomeClient() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Client-only hydration is required because browser storage is unavailable during SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFavorites(readLocal(storageKeys.favorites, [])); setRecent(readLocal(storageKeys.recent, [])); }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const visible = useMemo(() => tools.filter((tool) => {
    const haystack = `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase();
    return (category === 'All' || tool.category === category) && haystack.includes(query.toLowerCase());
  }), [category, query]);
  const toggleFavorite = (slug: string) => {
    const next = favorites.includes(slug) ? favorites.filter((item) => item !== slug) : [...favorites, slug];
    setFavorites(next);
    writeLocal(storageKeys.favorites, next);
  };
  const card = (tool: (typeof tools)[number]) => (
    <article className="tool-card" key={tool.slug}>
      <Link className="card-main" href={`/${tool.slug}`}>
        <span className="tool-icon" aria-hidden="true">{tool.icon}</span>
        <span className="tool-card-copy"><strong>{tool.name}</strong><small>{tool.description}</small></span>
        <span className="arrow" aria-hidden="true">↗</span>
      </Link>
      <button className={favorites.includes(tool.slug) ? 'favorite active' : 'favorite'} onClick={() => toggleFavorite(tool.slug)} aria-label={`${favorites.includes(tool.slug) ? 'Remove' : 'Add'} ${tool.name} ${favorites.includes(tool.slug) ? 'from' : 'to'} favorites`}>☆</button>
    </article>
  );
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.slug));
  const recentTools = recent.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean) as typeof tools;

  return (
    <main>
      <header className="site-header"><Brand /><nav><a href="#tools">Tools</a>{favoriteTools.length > 0 && <a href="#favorites">Favorites</a>}<Link href="/about">About</Link></nav></header>
      <section className="hero wrap"><p className="eyebrow">14 everyday utilities</p><h1>Useful tools.<br /><span>One place.</span></h1><p className="hero-copy">Everyday calculators and utilities without the clutter. Fast, private, and free to use.</p></section>
      <section className="tool-browser wrap" id="tools" aria-label="Browse tools">
        <label className="search-field"><span aria-hidden="true">⌕</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" aria-label="Search tools" /><kbd>/</kbd></label>
        <div className="category-row" aria-label="Filter by category">{categories.map((item) => <button key={item} className={item === category ? 'chip active' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {!query && category === 'All' && favoriteTools.length > 0 && <><div className="section-heading" id="favorites"><h2>Favorites</h2><span>{favoriteTools.length}</span></div><div className="tool-grid">{favoriteTools.map(card)}</div></>}
        {!query && category === 'All' && recentTools.length > 0 && <><div className="section-heading"><h2>Recently used</h2><span>{recentTools.length}</span></div><div className="recent-row">{recentTools.map((tool) => <Link key={tool.slug} href={`/${tool.slug}`}><span>{tool.icon}</span>{tool.name}</Link>)}</div></>}
        <div className="section-heading"><h2>{category === 'All' ? 'All tools' : category}</h2><span>{visible.length} {visible.length === 1 ? 'tool' : 'tools'}</span></div>
        {visible.length ? <div className="tool-grid">{visible.map(card)}</div> : <div className="empty-state"><strong>No tools found</strong><span>Try a different search or category.</span></div>}
      </section>
      <footer className="wrap"><span>UtiliCrate</span><span>Your data stays on this device.</span></footer>
    </main>
  );
}
