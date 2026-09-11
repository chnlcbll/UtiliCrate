'use client';

import Image from 'next/image';
import styles from './who-bmi-chart.module.css';

type Props = { age: number; bmi: number; sex: 'female' | 'male' };

export function WhoBmiChart({ age, bmi, sex }: Props) {
  const ageOnChart = Math.max(5, Math.min(19, age));
  const bmiOnChart = Math.max(12, Math.min(30, bmi));
  const left = 13.5 + ((ageOnChart - 5) / 14) * 70.5;
  const top = 84.5 - ((bmiOnChart - 12) / 18) * 62.3;
  const label = sex === 'female' ? 'Girls' : 'Boys';

  return <section className={styles.section} aria-labelledby="who-chart-title">
    <header className={styles.header}>
      <div><span>WHO 2007 reference</span><h2 id="who-chart-title">BMI-for-age chart</h2></div>
      <p>{label} · ages 5–19</p>
    </header>
    <div className={styles.frame} role="img" aria-label={`WHO BMI-for-age percentile chart for ${label.toLowerCase()}. Your marker is at age ${age.toFixed(1)} and BMI ${bmi.toFixed(1)}. The chart is visual reference only and does not calculate a percentile.`}>
      <Image src={`/references/who-bmi-for-age-${sex === 'female' ? 'girls' : 'boys'}.png`} alt="" width={1764} height={1324} sizes="(max-width: 720px) 100vw, 1100px" />
      <span className={styles.marker} style={{ left: `${left}%`, top: `${top}%` }} aria-hidden="true"><i /><b>Your BMI<br />{bmi.toFixed(1)}</b></span>
    </div>
    <div className={styles.note}>
      <p><strong>Your plotted point:</strong> age {age.toFixed(1)}, BMI {bmi.toFixed(1)}. Curves show the 3rd, 15th, 50th, 85th, and 97th percentiles.</p>
      <p>This visual does not estimate a percentile or make a diagnosis. Growth patterns are best interpreted over time by a qualified health professional.</p>
      <a href="https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age" target="_blank" rel="noreferrer">View the WHO reference source ↗</a>
    </div>
  </section>;
}
