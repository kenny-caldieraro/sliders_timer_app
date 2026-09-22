import { useSyncExternalStore } from 'react';

import { NEOPIXEL_COUNT } from './layout';

/**
 * Bandeau de sept NeoPixel formant l'arc autour du potentiomètre.
 *
 * Le firmware s'en sert pour trois choses : afficher le niveau du
 * potentiomètre, faire « respirer » le minuteur au repos, et accélérer cette
 * respiration à mesure que le temps restant fond.
 */

export type StripState = {
  /** Nombre de pixels allumés, de 0 à 7. */
  level: number;
  /** Luminosité globale, de 0 à 255. */
  brightness: number;
};

let state: StripState = { level: 0, brightness: 0 };
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const commit = (next: StripState) => {
  if (next.level === state.level && next.brightness === state.brightness) {
    return;
  }
  state = next;
  notify();
};

/** Nombre de pixels allumés. */
export function setLevel(level: number) {
  commit({ ...state, level: Math.min(Math.max(Math.round(level), 0), NEOPIXEL_COUNT) });
}

/** Luminosité globale, comme `strip.setBrightness`. */
export function setBrightness(brightness: number) {
  commit({ ...state, brightness: Math.min(Math.max(Math.round(brightness), 0), 255) });
}

/** Éteint le bandeau. */
export function clearStrip() {
  commit({ level: 0, brightness: 0 });
}

export function readStrip(): StripState {
  return state;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

export function useStrip(): StripState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Respiration du bandeau. La période vient de `pulseNeoPixel` : plus le temps
 * restant est court, plus le battement est rapide.
 */
export function periodForRemaining(seconds: number): number {
  if (seconds <= 5) return 200;
  if (seconds <= 10) return 350;
  if (seconds <= 20) return 600;
  if (seconds <= 30) return 900;
  return 1800;
}

/** Luminosité instantanée d'une respiration, entre `min` et `max`. */
export function breathe(elapsedMs: number, periodMs: number, min: number, max: number): number {
  const half = periodMs / 2;
  const phase = elapsedMs % periodMs;
  const span = max - min;
  return phase < half ? min + (span * phase) / half : max - (span * (phase - half)) / half;
}

/** Période de la respiration au repos, reprise de `idleAnimation`. */
export const IDLE_PERIOD_MS = 3000;
export const IDLE_BRIGHTNESS = { min: 3, max: 15 } as const;
export const RUNNING_BRIGHTNESS = { min: 5, max: 50 } as const;
