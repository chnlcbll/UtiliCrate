'use client';

import { useState } from 'react';
import { ActionRow, Field, Result } from '@/components/tool-shell';
import { PdfButton } from '@/components/pdf/pdf-button';
import { calculateBmi } from '@/lib/calculations';
import { WhoBmiChart } from '@/components/tools/who-bmi-chart';

const KG_TO_LB = 2.2046226218;
const CM_PER_INCH = 2.54;
const rounded = (value: number, places = 1) => Number(value.toFixed(places));

export function BodyIndexTool() {
  const [system, setSystem] = useState<'metric' | 'imperial'>('metric');
  const [age, setAge] = useState(20);
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [weightKg, setWeightKg] = useState(68);
  const [heightCm, setHeightCm] = useState(170);
  const weightLb = rounded(weightKg * KG_TO_LB);
  const totalInches = heightCm / CM_PER_INCH;
  const feet = Math.floor(totalInches / 12);
  const inches = rounded(totalInches - feet * 12);
  const result = calculateBmi(weightKg, heightCm, 'metric');
  const valid = age >= 0 && weightKg > 0 && heightCm > 0 && Number.isFinite(result.bmi);
  const isAdult = age >= 20;
  const range = system === 'metric' ? `${result.referenceMinKg.toFixed(1)}–${result.referenceMaxKg.toFixed(1)} kg` : `${(result.referenceMinKg * 2.2046226218).toFixed(1)}–${(result.referenceMaxKg * 2.2046226218).toFixed(1)} lb`;
  const scalePosition = valid ? Math.max(0, Math.min(100, (result.bmi - 12) / 33 * 100)) : 0;
  const setFeet = (nextFeet: number) => setHeightCm((nextFeet * 12 + inches) * CM_PER_INCH);
  const setInches = (nextInches: number) => setHeightCm((feet * 12 + nextInches) * CM_PER_INCH);
  const weightFields = system === 'metric' ? <><Field label="Weight (kg)"><input type="number" min="1" step="0.1" value={rounded(weightKg)} onChange={(e) => setWeightKg(Number(e.target.value))} /></Field><Field label="Weight equivalent (lb)"><input type="number" min="1" step="0.1" value={weightLb} onChange={(e) => setWeightKg(Number(e.target.value) / KG_TO_LB)} /></Field></> : <><Field label="Weight (lb)"><input type="number" min="1" step="0.1" value={weightLb} onChange={(e) => setWeightKg(Number(e.target.value) / KG_TO_LB)} /></Field><Field label="Weight equivalent (kg)"><input type="number" min="1" step="0.1" value={rounded(weightKg)} onChange={(e) => setWeightKg(Number(e.target.value))} /></Field></>;
  const heightFields = system === 'metric' ? <><Field label="Height (cm)"><input type="number" min="1" step="0.1" value={rounded(heightCm)} onChange={(e) => setHeightCm(Number(e.target.value))} /></Field><Field label="Height (feet)"><input type="number" min="1" max="8" step="1" value={feet} onChange={(e) => setFeet(Number(e.target.value))} /></Field><Field label="Height (inches)"><input type="number" min="0" max="11.9" step="0.1" value={inches} onChange={(e) => setInches(Number(e.target.value))} /></Field></> : <><Field label="Height (feet)"><input type="number" min="1" max="8" step="1" value={feet} onChange={(e) => setFeet(Number(e.target.value))} /></Field><Field label="Height (inches)"><input type="number" min="0" max="11.9" step="0.1" value={inches} onChange={(e) => setInches(Number(e.target.value))} /></Field><Field label="Height equivalent (cm)"><input type="number" min="1" step="0.1" value={rounded(heightCm)} onChange={(e) => setHeightCm(Number(e.target.value))} /></Field></>;
  return <>
    <div className="tool-layout">
      <section className="control-card">
        <div className="field-grid"><Field label="Age"><input type="number" min="0" step="0.1" value={age} onChange={(event) => setAge(Math.max(0, Number(event.target.value)))} /></Field><Field label="Sex for BMI-for-age context" hint="Adult BMI calculations and categories do not vary by sex."><select value={sex} onChange={(event) => setSex(event.target.value as 'female' | 'male')}><option value="female">Female</option><option value="male">Male</option></select></Field></div>
        <p className="adult-note">{isAdult ? 'Adult BMI categories apply from age 20 and do not vary by sex.' : age >= 5 ? `Your BMI can be plotted on the WHO 2007 ${sex === 'female' ? 'girls' : 'boys'} reference chart below.` : 'The WHO BMI-for-age chart below begins at age 5.'}</p>
        <div className="segmented"><button className={system === 'metric' ? 'active' : ''} onClick={() => setSystem('metric')}>Metric</button><button className={system === 'imperial' ? 'active' : ''} onClick={() => setSystem('imperial')}>Imperial</button></div>
        <div className="field-grid">{weightFields}</div>
        <div className="field-grid three">{heightFields}</div>
        <ActionRow><PdfButton disabled={!valid} report={{ tool: 'BMI Calculator', title: 'Body Mass Index Summary', accent: '#667578', hero: { label: 'BMI', value: result.bmi.toFixed(1), detail: isAdult ? result.category : 'BMI-for-age context' }, sections: [{ kind: 'metrics', title: 'Measurements', items: [{ label: 'Age', value: String(age) }, { label: 'Height', value: `${heightCm.toFixed(1)} cm`, detail: `${feet} ft ${inches} in` }, { label: 'Weight', value: `${weightKg.toFixed(1)} kg`, detail: `${weightLb} lb` }, { label: 'Reference sex', value: sex === 'female' ? 'Female' : 'Male' }] }, ...(isAdult ? [{ kind: 'rows' as const, title: 'Adult screening context', rows: [{ label: 'Standard category', value: result.category }, { label: 'BMI-based reference weight range', value: range }] }] : [{ kind: 'text' as const, title: 'BMI-for-age context', body: age >= 5 ? 'The result can be plotted against the WHO 2007 BMI-for-age reference for ages 5–19. This report does not estimate a percentile or category.' : 'The WHO 5–19 BMI-for-age reference does not apply below age 5.' }]) ], disclaimer: 'BMI is a population-level screening measure, not a diagnosis or personal medical recommendation. A qualified health professional can interpret it alongside other information.' }}>Download PDF</PdfButton></ActionRow>
      </section>
      <Result eyebrow={isAdult ? 'Adult BMI screening result' : 'BMI result'} title={valid ? result.bmi.toFixed(1) : 'Enter valid measurements'}>
        {valid && (isAdult ? <>
          <div className="bmi-scale" role="img" aria-label={`BMI ${result.bmi.toFixed(1)}, ${result.category}, shown on the standard adult BMI scale`}><div className="bmi-scale-marker" style={{ left: `${scalePosition}%` }}><span>{result.bmi.toFixed(1)}</span></div><div className="bmi-scale-track"><i className="under" /><i className="healthy" /><i className="over" /><i className="obesity" /></div><div className="bmi-scale-labels"><span>Under</span><span>Healthy</span><span>Over</span><span>Obesity</span></div></div>
          <div className="result-list"><span>Standard adult category: {result.category}</span><span>BMI-based reference weight range: {range}</span></div>
        </> : <div className="result-list"><span>{age >= 5 ? 'WHO BMI-for-age reference applies from ages 5 through 19.' : 'The WHO 5–19 BMI-for-age reference does not apply at this age.'}</span><span>Selected reference sex: {sex === 'female' ? 'Female' : 'Male'}.</span><span>This tool plots the BMI value visually but does not estimate a percentile or category.</span></div>)}
      </Result>
    </div>
    {valid && !isAdult && age >= 5 && <WhoBmiChart age={age} bmi={result.bmi} sex={sex} />}
    <section className="info-panel"><h2>What this number can—and cannot—tell you</h2><p>BMI is a population-level screening measure. It is not a direct measurement of body fat, does not distinguish muscle from fat mass, and should not be used alone to assess health.</p><div className="info-columns"><p>For children and teens, interpretation requires validated BMI-for-age reference data. A pediatric health professional can provide appropriate context.</p><p>It may be less informative for very muscular people. Pregnancy and other situations can also require professional context.</p><p>This result is not a diagnosis or personal medical recommendation. A qualified health professional can interpret it alongside other information.</p></div></section>
  </>;
}
