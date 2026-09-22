import { useCallback, useSyncExternalStore } from 'react';

import { digitToSegments } from './segments';
import type { MatrixIndex } from './layout';

/**
 * Les deux matrices MAX7219 de la réplique, reproduites en mémoire.
 *
 * L'intérêt n'est pas seulement la fidélité : chaque ligne a son propre jeu
 * d'abonnés, donc écrire une ligne ne re-rend que l'afficheur correspondant.
 * Une image d'animation qui touche onze lignes provoque onze rendus ciblés,
 * là où l'ancienne version re-rendait toute l'interface cinquante fois par
 * seconde sans que rien ne change.
 *
 * L'API reprend volontairement celle de LedControl côté Arduino — `setRow`,
 * `setLed`, `setDigit`, `clearDisplay`, `setIntensity`, `shutdown` — pour
 * qu'une séquence portée depuis le firmware se relise ligne pour ligne.
 */

const MATRIX_COUNT = 2;
const ROW_COUNT = 8;
const MAX_INTENSITY = 15;

const rows: Uint8Array[] = Array.from({ length: MATRIX_COUNT }, () => new Uint8Array(ROW_COUNT));

const rowListeners: Set<() => void>[][] = Array.from({ length: MATRIX_COUNT }, () =>
  Array.from({ length: ROW_COUNT }, () => new Set<() => void>()),
);

/** Abonnements stables par (matrice, ligne) — exigés par `useSyncExternalStore`. */
const rowSubscribers = rowListeners.map((matrix) =>
  matrix.map((set) => (listener: () => void) => {
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }),
);

type ChromeState = { intensity: readonly [number, number]; off: readonly [boolean, boolean] };

let chrome: ChromeState = { intensity: [MAX_INTENSITY, MAX_INTENSITY], off: [false, false] };
const chromeListeners = new Set<() => void>();

const notifyRow = (matrix: MatrixIndex, row: number) => {
  rowListeners[matrix]?.[row]?.forEach((listener) => listener());
};

const notifyChrome = () => {
  chromeListeners.forEach((listener) => listener());
};

/** Écrit l'octet de segments d'une ligne entière. */
export function setRow(matrix: MatrixIndex, row: number, value: number) {
  const target = rows[matrix];
  if (!target || row < 0 || row >= ROW_COUNT) {
    return;
  }
  const byte = value & 0xff;
  if (target[row] === byte) {
    return;
  }
  target[row] = byte;
  notifyRow(matrix, row);
}

/** Allume ou éteint une LED isolée. */
export function setLed(matrix: MatrixIndex, row: number, column: number, on: boolean) {
  const target = rows[matrix];
  if (!target || row < 0 || row >= ROW_COUNT || column < 0 || column > 7) {
    return;
  }
  const mask = 1 << column;
  const current = target[row] ?? 0;
  const next = on ? current | mask : current & ~mask;
  if (current === next) {
    return;
  }
  target[row] = next & 0xff;
  notifyRow(matrix, row);
}

/** Affiche un chiffre 0-9 sur une ligne. */
export function setDigit(matrix: MatrixIndex, row: number, digit: number, dot = false) {
  setRow(matrix, row, digitToSegments(digit) | (dot ? 0x80 : 0));
}

/** Éteint toutes les lignes d'une matrice. */
export function clearDisplay(matrix: MatrixIndex) {
  for (let row = 0; row < ROW_COUNT; row += 1) {
    setRow(matrix, row, 0);
  }
}

/** Éteint les deux matrices. */
export function clearAll() {
  clearDisplay(0);
  clearDisplay(1);
}

/** Écrit plusieurs lignes consécutives d'un coup, à partir de la ligne 0. */
export function setRows(matrix: MatrixIndex, values: readonly number[]) {
  values.forEach((value, row) => setRow(matrix, row, value));
}

/** Luminosité d'une matrice, de 0 à 15 — utilisée par le fondu d'allumage. */
export function setIntensity(matrix: MatrixIndex, level: number) {
  const clamped = Math.min(Math.max(Math.round(level), 0), MAX_INTENSITY);
  if (chrome.intensity[matrix] === clamped) {
    return;
  }
  const intensity: [number, number] = [...chrome.intensity] as [number, number];
  intensity[matrix] = clamped;
  chrome = { ...chrome, intensity };
  notifyChrome();
}

/** Coupe ou rallume une matrice, comme `lc.shutdown`. */
export function shutdown(matrix: MatrixIndex, isOff: boolean) {
  if (chrome.off[matrix] === isOff) {
    return;
  }
  const off: [boolean, boolean] = [...chrome.off] as [boolean, boolean];
  off[matrix] = isOff;
  chrome = { ...chrome, off };
  notifyChrome();
}

/** Lecture directe — pour les tests et les séquences qui composent une image. */
export function readRow(matrix: MatrixIndex, row: number): number {
  return rows[matrix]?.[row] ?? 0;
}

/** Remet le matériel dans son état initial. */
export function resetDisplay() {
  clearAll();
  chrome = { intensity: [MAX_INTENSITY, MAX_INTENSITY], off: [false, false] };
  notifyChrome();
}

/** S'abonne à une ligne : le composant n'est re-rendu que si cette ligne change. */
export function useRow(matrix: MatrixIndex, row: number): number {
  const subscribe = rowSubscribers[matrix]?.[row];
  const getSnapshot = useCallback(() => readRow(matrix, row), [matrix, row]);
  return useSyncExternalStore(subscribe ?? noopSubscribe, getSnapshot, getSnapshot);
}

/** S'abonne à une LED isolée. */
export function useLed(matrix: MatrixIndex, row: number, column: number): boolean {
  return (useRow(matrix, row) & (1 << column)) !== 0;
}

/** Luminosité et état d'extinction des matrices. */
export function useChrome(): ChromeState {
  return useSyncExternalStore(subscribeChrome, getChrome, getChrome);
}

const getChrome = () => chrome;

const subscribeChrome = (listener: () => void) => {
  chromeListeners.add(listener);
  return () => {
    chromeListeners.delete(listener);
  };
};

const noopSubscribe = () => () => {};

export { MAX_INTENSITY, ROW_COUNT };
