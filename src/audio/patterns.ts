import { TONES, customTone, noTone } from './buzzer';

/**
 * Motifs de bips du décompte, repris de `updatespeaker_pattern` et des paliers
 * de `animation_normal` / `animation_burnout`.
 *
 * C'est cette montée en tension qui fait l'objet : le minuteur ne bipe pas
 * « plus vite », il passe par cinq régimes distincts, chacun avec son nombre
 * de bips, son intervalle et sa respiration.
 */

export type BeepPattern = {
  /** Temps d'attente avant chaque bip, en ms. */
  intervalMs: number;
  /** Nombre de bips avant la respiration. */
  count: number;
  /** Respiration entre deux salves, en ms. */
  pauseMs: number;
};

/** Durée d'un bip, constante dans le firmware. */
const BEEP_MS = 50;

export const PATTERNS = {
  calm: { intervalMs: 500, count: 2, pauseMs: 0 },
  warning: { intervalMs: 25, count: 5, pauseMs: 500 },
  urgent: { intervalMs: 15, count: 10, pauseMs: 330 },
  panic: { intervalMs: 10, count: 10, pauseMs: 200 },
  critical: { intervalMs: 5, count: 15, pauseMs: 100 },
} as const satisfies Record<string, BeepPattern>;

export type PatternName = keyof typeof PATTERNS | 'final';

/** Le régime sonore correspondant au temps restant, en secondes. */
export function patternForRemaining(seconds: number): PatternName {
  if (seconds <= 1) {
    return 'final';
  }
  if (seconds <= 5) {
    return 'critical';
  }
  if (seconds <= 10) {
    return 'panic';
  }
  if (seconds <= 20) {
    return 'urgent';
  }
  if (seconds <= 30) {
    return 'warning';
  }
  return 'calm';
}

let timer: ReturnType<typeof setTimeout> | null = null;
let currentName: PatternName | null = null;

const clear = () => {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
};

const runSalvo = (pattern: BeepPattern, remaining: number) => {
  if (remaining <= 0) {
    timer = setTimeout(() => runSalvo(pattern, pattern.count), pattern.pauseMs || pattern.intervalMs);
    return;
  }
  timer = setTimeout(() => {
    customTone(TONES.countdown, BEEP_MS);
    runSalvo(pattern, remaining - 1);
  }, pattern.intervalMs);
};

/**
 * Applique un régime sonore. Rappeler avec le même nom ne relance rien —
 * c'est ce qui évite le rythme incohérent qu'on obtient en réinitialisant
 * le compteur de bips à chaque tick.
 */
export function applyBeepPattern(name: PatternName | null) {
  if (name === currentName) {
    return;
  }
  currentName = name;
  clear();

  if (name === null) {
    noTone();
    return;
  }
  if (name === 'final') {
    customTone(TONES.lock, 1500);
    return;
  }
  runSalvo(PATTERNS[name], PATTERNS[name].count);
}

/** Coupe le motif en cours. */
export function stopBeepPattern() {
  currentName = null;
  clear();
  noTone();
}
