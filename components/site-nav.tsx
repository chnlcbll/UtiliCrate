'use client';

import { Menu, Search, X, ArrowUpRight, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Brand } from '@/components/brand';
import { tools } from '@/data/tools';
import { ToolIcon } from '@/components/tool-icon';
import { usePreferences, type DashboardMode } from '@/components/preferences-provider';

function ModeControl({ onChange }: { onChange?: () => void }) {
  const { dashboardMode, setDashboardMode } = usePreferences();
  const choose = (mode: DashboardMode) => { setDashboardMode(mode); onChange?.(); };
  return <div className="mode-control" aria-label="Dashboard interface mode">
    <button className={dashboardMode === 'standard' ? 'active' : ''} aria-pressed={dashboardMode === 'standard'} onClick={() => choose('standard')}><strong>Standard</strong><small>Explore</small></button>
    <button className={dashboardMode === 'simple' ? 'active' : ''} aria-pressed={dashboardMode === 'simple'} onClick={() => choose('simple')}><strong>Simple</strong><small>Compact</small></button>
  </div>;
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const preferencesRef = useRef<HTMLDivElement>(null);
  const { soundEnabled, setSoundEnabled } = usePreferences();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName ?? '')) { event.preventDefault(); const simpleSearch = document.getElementById('simple-tool-search') as HTMLInputElement | null; if (window.location.pathname === '/' && document.documentElement.dataset.dashboardMode === 'simple' && simpleSearch) simpleSearch.focus(); else setSearchOpen(true); }
      if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); setPreferencesOpen(false); }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => { if (searchOpen) requestAnimationFrame(() => inputRef.current?.focus()); }, [searchOpen]);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (preferencesRef.current && !preferencesRef.current.contains(event.target as Node)) setPreferencesOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const results = useMemo(() => tools.filter((tool) => `${tool.name} ${tool.category} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query]);
  const closeAll = () => { setSearchOpen(false); setMenuOpen(false); setPreferencesOpen(false); setQuery(''); };

  return <>
    <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation"><a href="/#all-tools">Tools</a><a href="/#categories">Categories</a><a href="/#favorites">Favorites</a><a href="/about">About</a></nav>
      <div className="nav-actions"><button className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search tools"><Search size={17} /><span>Search</span></button><div className="preferences-wrap" ref={preferencesRef}><button className="preferences-trigger" onClick={() => setPreferencesOpen((open) => !open)} aria-expanded={preferencesOpen} aria-label="Interface preferences"><SlidersHorizontal size={18} /></button>{preferencesOpen && <section className="preferences-popover" aria-label="Interface preferences"><header><span>Preferences</span><button onClick={() => setPreferencesOpen(false)} aria-label="Close preferences"><X size={17} /></button></header><span className="preferences-label">Dashboard</span><ModeControl onChange={() => setPreferencesOpen(false)} /><div className="sound-setting"><span><strong>Sound effects</strong><small>Subtle feedback for meaningful actions</small></span><button className={soundEnabled ? 'sound-toggle on' : 'sound-toggle'} onClick={() => setSoundEnabled(!soundEnabled)} aria-pressed={soundEnabled}>{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{soundEnabled ? 'On' : 'Off'}</button></div><p>Motion follows your device’s reduced-motion setting.</p></section>}</div><button className="menu-trigger" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Open navigation menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      {menuOpen && <div className="mobile-menu"><button onClick={() => { setSearchOpen(true); setMenuOpen(false); }}><Search size={18} /> Search tools</button><a href="/#all-tools" onClick={closeAll}>All tools <ArrowUpRight size={17} /></a><a href="/#categories" onClick={closeAll}>Categories <ArrowUpRight size={17} /></a><a href="/about" onClick={closeAll}>About & privacy <ArrowUpRight size={17} /></a><div className="mobile-preferences"><span>Dashboard</span><ModeControl /><div className="mobile-sound"><span>{soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />} Sound effects</span><button className={soundEnabled ? 'sound-toggle on' : 'sound-toggle'} onClick={() => setSoundEnabled(!soundEnabled)} aria-pressed={soundEnabled}>{soundEnabled ? 'On' : 'Off'}</button></div></div></div>}
    </header>
    {searchOpen && <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAll(); }}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Search tools"><div className="command-input"><Search size={20} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you need?" aria-label="Search all tools" /><button onClick={closeAll} aria-label="Close search"><X size={18} /></button></div><div className="command-results">{results.map((tool) => <a href={`/${tool.slug}`} key={tool.slug} onClick={closeAll}><span className="command-icon"><ToolIcon slug={tool.slug} size={19} /></span><span><strong>{tool.name}</strong><small>{tool.category} · {tool.description}</small></span><ArrowUpRight size={17} /></a>)}{!results.length && <p>No tools match “{query}”.</p>}</div><footer><span>Type to search</span><span><kbd>Esc</kbd> to close</span></footer></section></div>}
  </>;
}
