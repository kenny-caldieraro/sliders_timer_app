import { DAY, HOUR, MINUTE, SECOND } from '../timer/types';
import { clearAll, setDigit, setLed, setRow } from './display';
import {
  COLON_COLUMNS,
  COLON_ROW,
  DAY_DIGITS,
  EDGE_PATTERN,
  EDGE_ROW,
  EMITTER_COLUMNS,
  EMITTER_ROW,
  HOURS,
  MINUTES,
  SECONDS,
  STATUS_LEDS,
  STATUS_ROW,
} from './layout';

/**
 * Écriture de l'heure sur les matrices — l'équivalent de `showTime()`.
 * On écrit des chiffres, pas des chaînes : chaque afficheur est indépendant.
 */
export function showTime(remainingMs: number) {
  const total = Math.max(0, Math.floor(remainingMs));
  const days = Math.floor(total / DAY);
  const hours = Math.floor((total % DAY) / HOUR);
  const minutes = Math.floor((total % HOUR) / MINUTE);
  const seconds = Math.floor((total % MINUTE) / SECOND);

  setDigit(DAY_DIGITS[0]!.matrix, DAY_DIGITS[0]!.row, Math.floor(days / 100) % 10);
  setDigit(DAY_DIGITS[1]!.matrix, DAY_DIGITS[1]!.row, Math.floor(days / 10) % 10);
  setDigit(DAY_DIGITS[2]!.matrix, DAY_DIGITS[2]!.row, days % 10);

  setDigit(HOURS.tens.matrix, HOURS.tens.row, Math.floor(hours / 10));
  setDigit(HOURS.units.matrix, HOURS.units.row, hours % 10);

  setDigit(MINUTES.tens.matrix, MINUTES.tens.row, Math.floor(minutes / 10));
  setDigit(MINUTES.units.matrix, MINUTES.units.row, minutes % 10);

  setDigit(SECONDS.tens.matrix, SECONDS.tens.row, Math.floor(seconds / 10));
  setDigit(SECONDS.units.matrix, SECONDS.units.row, seconds % 10);
}

/** Allume ou éteint les quatre points des séparateurs d'un coup. */
export function setColons(on: boolean) {
  COLON_COLUMNS.forEach((column) => setLed(COLON_ROW.matrix, COLON_ROW.row, column, on));
}

/** Chenillard des extrémités : allumé dès que le minuteur fonctionne. */
export function setEdges(on: boolean) {
  setRow(EDGE_ROW.matrix, EDGE_ROW.row, on ? EDGE_PATTERN : 0);
}

/** Témoin latéral par nom. */
export function setStatusLed(label: (typeof STATUS_LEDS)[number]['label'], on: boolean) {
  const led = STATUS_LEDS.find((entry) => entry.label === label);
  if (led) {
    setLed(STATUS_ROW.matrix, STATUS_ROW.row, led.column, on);
  }
}

/** LED de l'émetteur, qui s'animent dans les dernières secondes. */
export function setEmitter(pattern: readonly boolean[]) {
  EMITTER_COLUMNS.forEach((column, index) =>
    setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, column, pattern[index] ?? false),
  );
}

/** Éteint tout : matrices, témoins, séparateurs. */
export function blankAll() {
  clearAll();
}
