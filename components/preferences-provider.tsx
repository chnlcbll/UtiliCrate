'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { playLocalCue, type SoundCue } from '@/lib/sound';
import { readLocal, storageKeys, writeLocal } from '@/lib/storage';

export type DashboardMode = 'standard' | 'simple';
export type UserPreferences = { dashboardMode: DashboardMode; soundEnabled: boolean };

const defaults: UserPreferences = { dashboardMode: 'standard', soundEnabled: false };

type PreferenceContextValue = UserPreferences & {
  setDashboardMode: (mode: DashboardMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (cue: SoundCue, options?: { force?: boolean; volume?: number }) => void;
};

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readLocal<UserPreferences>(storageKeys.preferences, defaults);
    // Client-only hydration is required because browser storage is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferences({ ...defaults, ...saved });
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.dashboardMode = preferences.dashboardMode;
    if (ready) writeLocal(storageKeys.preferences, preferences);
  }, [preferences, ready]);

  const setDashboardMode = useCallback((dashboardMode: DashboardMode) => {
    setPreferences((current) => ({ ...current, dashboardMode }));
  }, []);

  const setSoundEnabled = useCallback((soundEnabled: boolean) => {
    setPreferences((current) => ({ ...current, soundEnabled }));
  }, []);

  const playSound = useCallback((cue: SoundCue, options?: { force?: boolean; volume?: number }) => {
    if (preferences.soundEnabled || options?.force) playLocalCue(cue, options?.volume ?? 1);
  }, [preferences.soundEnabled]);

  const value = useMemo(() => ({ ...preferences, setDashboardMode, setSoundEnabled, playSound }), [preferences, setDashboardMode, setSoundEnabled, playSound]);
  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferenceContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
