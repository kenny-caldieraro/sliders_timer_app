import { useSyncExternalStore } from 'react';

import { NEOPIXEL_COUNT } from './layout';

/**
 * Bandeau de sept NeoPixel formant l'arc autour du potentiomètre.
 *
 * Deux valeurs distinctes, et c'est important :
 *
 *   `knob`  la position du bouton. Sur l'objet, c'est un potentiomètre :
 *           aucun programme ne peut le faire tourner. Seul l'utilisateur
 *           la change.
 *   `level` le nombre de segments réellement allumés. Au repos il suit la
 *           position du bouton, mais les animations le prennent la main le
 *           temps d'une séquence.
 *
 * Les confondre faisait tourner le bouton pendant les animations.
 */

export type StripState = {
  /** Position du bouton, de 0 à 7 — jamais modifiée par une animation. */
  knob: number;
  /** Segments allumés, de 0 à 7. */
  level: number;
  /** Luminosité globale, de 0 à 255. */
  brightness: number;
};

const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), NEOPIXEL_COUNT);

/** Position de départ, reprise de la valeur initiale du potentiomètre. */
const DEFAULT_KNOB = 5;

let state: StripState = { knob: DEFAULT_KNOB, level: DEFAULT_KNOB, brightness: 0 };
const listeners = new Set<() => void>();

const commit = (next: StripState) => {
  if (
    next.knob === state.knob &&
    next.level === state.level &&
    next.brightness === state.brightness
  ) {
    return;
  }
  state = next;
  listeners.forEach((listener) => listener());
};

/** Déplacement du bouton par l'utilisateur : la lumière suit. */
export function setKnob(position: number) {
  const knob = clamp(position);
  commit({ ...state, knob, level: knob });
}

/** Une animation prend la main sur le nombre de segments allumés. */
export function setLevel(level: number) {
  commit({ ...state, level: clamp(level) });
}

/** Fin d'animation : la lumière revient à la position du bouton. */
export function releaseLevel() {
  commit({ ...state, level: state.knob });
}

/** Luminosité globale, comme `strip.setBrightness`. */
export function setBrightness(brightness: number) {
  commit({ ...state, brightness: Math.min(Math.max(Math.round(brightness), 0), 255) });
}

/** Éteint le bandeau sans oublier la position du bouton. */
export function clearStrip() {
  commit({ ...state, level: state.knob, brightness: 0 });
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

/**
 * Conversion de la luminosité NeoPixel en opacité d'affichage.
 *
 * Une correspondance linéaire rend le bandeau quasi invisible : une vraie LED
 * reste bien lisible à 15/255, alors qu'un pixel à 6 % d'opacité sur fond noir
 * ne l'est pas. On applique donc un plancher et une courbe en racine, qui
 * suit mieux la perception.
 */
export function toOpacity(brightness: number): number {
  if (brightness <= 0) {
    return 0;
  }
  const normalized = Math.min(brightness / 60, 1);
  return 0.4 + 0.6 * Math.sqrt(normalized);
}

/** Période de la respiration au repos, reprise de `idleAnimation`. */
export const IDLE_PERIOD_MS = 3000;
export const IDLE_BRIGHTNESS = { min: 3, max: 15 } as const;
export const RUNNING_BRIGHTNESS = { min: 5, max: 50 } as const;
