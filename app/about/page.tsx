'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clearToolioData } from '@/lib/storage';

export default function AboutPage() {
  const [cleared, setCleared] = useState(false);
  const clear = () => { if (window.confirm('This will remove saved favorites, allowance data, packing lists, receipts, decisions, and preferences from this browser. This cannot be undone.')) { clearToolioData(); setCleared(true); } };
  return <main><header className="site-header"><Link href="/" className="brand"><span className="brand-mark">T</span><span>Toolio</span></Link></header><div className="about-page wrap"><Link href="/" className="back-link">← All tools</Link><p className="eyebrow">About & privacy</p><h1>Small tools.<br />No hidden machinery.</h1><p className="lead">Toolio is a collection of useful everyday calculators and utilities. Every calculation happens inside your browser.</p><section className="privacy-panel"><h2>Your data stays on this device.</h2><p>Saved tools and preferences are stored locally in your browser. They are not uploaded to an account or external database. Clearing browser or site data may delete them.</p><ul><li>No accounts or sign-in</li><li>No AI or external calculation APIs</li><li>No database or cloud storage</li><li>No form-content analytics</li></ul><button className="button danger" onClick={clear}>Clear local data</button>{cleared && <p className="success" role="status">Toolio’s locally saved data has been cleared.</p>}</section></div></main>;
}
