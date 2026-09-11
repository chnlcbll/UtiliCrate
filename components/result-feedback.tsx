'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/components/preferences-provider';

const RESULT_SELECTOR = [
  '.result-card',
  '.math-display',
  '.unit-verdict',
  '.duration-answer',
  '.time-statement',
  '.age-hero',
  '.editor-panes label:last-child',
  '.list-pipeline label:last-child',
  '.wheel-card',
  '.coin-card',
  '.dice-card',
  '.countdown-card',
  '.palette-result',
  '.glyph-grid',
  '.priority-matrix',
].join(',');

export function ResultFeedback({ rootSelector }: { rootSelector: string }) {
  const { playSound } = usePreferences();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;

    const cleanupTimers = new Map<HTMLElement, number>();
    const throttleTimers = new Map<HTMLElement, number>();
    let soundTimer: number | undefined;
    let interactionUntil = 0;
    let interactionVersion = 0;
    let lastSoundVersion = 0;

    const scheduleResultSound = () => {
      const version = interactionVersion;
      if (!version || version <= lastSoundVersion) return;
      if (soundTimer) window.clearTimeout(soundTimer);
      soundTimer = window.setTimeout(() => {
        if (version !== interactionVersion || version <= lastSoundVersion) return;
        lastSoundVersion = version;
        playSound('result');
      }, 260);
    };

    const pulse = (surface: HTMLElement, withSound = false) => {
      if (withSound) scheduleResultSound();
      if (throttleTimers.has(surface)) return;
      surface.classList.remove('result-updated');
      void surface.offsetWidth;
      surface.classList.add('result-updated');
      const previous = cleanupTimers.get(surface);
      if (previous) window.clearTimeout(previous);
      cleanupTimers.set(surface, window.setTimeout(() => surface.classList.remove('result-updated'), 1050));
      throttleTimers.set(surface, window.setTimeout(() => throttleTimers.delete(surface), 240));
    };

    const register = (container: ParentNode, animate = false, withSound = false) => {
      const surfaces = container instanceof HTMLElement && container.matches(RESULT_SELECTOR)
        ? [container]
        : Array.from(container.querySelectorAll<HTMLElement>(RESULT_SELECTOR));
      surfaces.forEach((surface) => {
        surface.dataset.resultSurface = 'true';
        const hasCue = Array.from(surface.children).some((child) => child.classList.contains('result-feedback-cue'));
        if (!hasCue) {
          const cue = document.createElement('span');
          cue.className = 'result-feedback-cue';
          cue.textContent = 'Result updated';
          cue.setAttribute('aria-hidden', 'true');
          surface.appendChild(cue);
        }
        if (animate) window.setTimeout(() => pulse(surface, withSound), 120);
      });
    };

    register(root, true);

    const markInteraction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('input,select,textarea,button')) return;
      interactionVersion += 1;
      interactionUntil = Date.now() + 4200;
    };
    root.addEventListener('input', markInteraction, true);
    root.addEventListener('change', markInteraction, true);
    root.addEventListener('click', markInteraction, true);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && !node.classList.contains('result-feedback-cue')) {
            const recentInteraction = Date.now() < interactionUntil;
            register(node, recentInteraction, recentInteraction);
          }
        });
        const target = mutation.target instanceof HTMLElement ? mutation.target : mutation.target.parentElement;
        if (!target || target.closest('.result-feedback-cue')) return;
        const surface = target.closest<HTMLElement>('[data-result-surface="true"]');
        if (surface) {
          register(surface);
          if (Date.now() < interactionUntil) pulse(surface, true);
        }
      });
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      root.removeEventListener('input', markInteraction, true);
      root.removeEventListener('change', markInteraction, true);
      root.removeEventListener('click', markInteraction, true);
      if (soundTimer) window.clearTimeout(soundTimer);
      cleanupTimers.forEach((timer) => window.clearTimeout(timer));
      throttleTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [playSound, rootSelector]);

  return null;
}
