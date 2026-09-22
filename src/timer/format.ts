import { DAY, HOUR, MINUTE, SECOND, type SetupField, type TimerState } from './types';

/**
 * Mise en forme du temps restant.
 *
 * L'affichage lui-même passe par `hardware/render.showTime`, qui écrit
 * directement dans les matrices. Ces fonctions servent aux libellés
 * d'accessibilité, aux notifications et aux tests.
 */

export type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Découpe une durée en jours / heures / minutes / secondes. */
export function splitDuration(ms: number): Parts {
  const safe = Number.isFinite(ms) && ms > 0 ? Math.floor(ms) : 0;
  return {
    days: Math.floor(safe / DAY),
    hours: Math.floor((safe % DAY) / HOUR),
    minutes: Math.floor((safe % HOUR) / MINUTE),
    seconds: Math.floor((safe % MINUTE) / SECOND),
  };
}

const pad = (value: number, width = 2) => String(value).padStart(width, '0');

/** Forme « 000:00:00:00 », telle qu'affichée sur les matrices. */
export function formatDuration(ms: number): string {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  return `${pad(days, 3)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Formulation parlée, pour les lecteurs d'écran et les notifications. */
export function formatSpoken(ms: number): string {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} seconde${seconds > 1 ? 's' : ''}`);
  return parts.join(' ');
}

/** Vrai si ce champ est celui qu'on règle. */
export function isFieldSelected(state: TimerState, field: SetupField): boolean {
  return state.phase === 'setup' && state.setupField === field;
}

/** Temps restant en secondes, arrondi au supérieur — l'unité des paliers sonores. */
export function remainingSeconds(state: TimerState): number {
  return Math.ceil(state.remainingMs / SECOND);
}
