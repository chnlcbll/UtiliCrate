'use client';

export type SoundCue = 'tap' | 'result' | 'success' | 'selection' | 'completion' | 'focus-start' | 'focus-complete' | 'break-complete';

type Tone = { frequency: number; delay?: number; duration: number; gain: number; type?: OscillatorType };

const cues: Record<SoundCue, Tone[]> = {
  tap: [{ frequency: 320, duration: .045, gain: .025, type: 'sine' }],
  result: [
    { frequency: 392, duration: .09, gain: .026, type: 'sine' },
    { frequency: 523.25, delay: .055, duration: .13, gain: .024, type: 'sine' },
  ],
  success: [
    { frequency: 440, duration: .12, gain: .035, type: 'sine' },
    { frequency: 659.25, delay: .08, duration: .16, gain: .035, type: 'sine' },
  ],
  selection: [
    { frequency: 349.23, duration: .08, gain: .028, type: 'triangle' },
    { frequency: 523.25, delay: .06, duration: .14, gain: .032, type: 'sine' },
  ],
  completion: [
    { frequency: 392, duration: .24, gain: .04, type: 'sine' },
    { frequency: 523.25, delay: .1, duration: .28, gain: .038, type: 'sine' },
    { frequency: 659.25, delay: .2, duration: .34, gain: .034, type: 'sine' },
  ],
  'focus-start': [
    { frequency: 261.63, duration: .28, gain: .035, type: 'sine' },
    { frequency: 392, delay: .11, duration: .32, gain: .026, type: 'sine' },
  ],
  'focus-complete': [
    { frequency: 329.63, duration: .34, gain: .04, type: 'sine' },
    { frequency: 493.88, delay: .14, duration: .42, gain: .035, type: 'sine' },
    { frequency: 659.25, delay: .28, duration: .46, gain: .03, type: 'sine' },
  ],
  'break-complete': [
    { frequency: 293.66, duration: .32, gain: .038, type: 'sine' },
    { frequency: 440, delay: .16, duration: .4, gain: .032, type: 'sine' },
  ],
};

let audioContext: AudioContext | null = null;

export function playLocalCue(cue: SoundCue, volume = 1) {
  if (typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ??= new AudioContextClass();
  if (audioContext.state === 'suspended') void audioContext.resume();
  const now = audioContext.currentTime;
  cues[cue].forEach((tone) => {
    const start = now + (tone.delay ?? 0);
    const oscillator = audioContext!.createOscillator();
    const gain = audioContext!.createGain();
    oscillator.type = tone.type ?? 'sine';
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001, tone.gain * volume), start + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, start + tone.duration);
    oscillator.connect(gain);
    gain.connect(audioContext!.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration + .025);
  });
}
