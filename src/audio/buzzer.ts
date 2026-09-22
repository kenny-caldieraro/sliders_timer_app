import { AudioContext } from 'react-native-audio-api';

/**
 * Buzzer du minuteur.
 *
 * Le firmware pilote un piézo avec `tone(broche, fréquence, durée)`. Un MP/3
 * ne peut pas rendre ça : les fréquences portent l'information (5500 Hz pour
 * l'amorçage, 3820 Hz pour le décompte, 3000 Hz pour le verrouillage), et
 * les motifs de bips s'accélèrent avec l'urgence.
 *
 * On reproduit donc un oscillateur carré, comme le piézo, via l'API Web Audio.
 * L'API publique est volontairement celle du firmware : `customTone`, `noTone`,
 * `setBuzzerEnabled`.
 */

/** Fréquences relevées dans le firmware. */
export const TONES = {
  /** Bip de chaque image de la séquence d'amorçage. */
  boot: 5500,
  /** Bip du décompte, mesuré sur le clip d'origine. */
  countdown: 3820,
  /** Bip de verrouillage et de fin. */
  lock: 3000,
  /** Bip du menu. */
  menu: 3100,
  /** Alarme de fin de décompte. */
  alarm: 2500,
  /** Incrément / décrément dans les menus. */
  increment: 3000,
  decrement: 2900,
} as const;

const VOLUME = 0.12;
const ATTACK_S = 0.004;
const RELEASE_S = 0.006;

let context: AudioContext | null = null;
let active: { stop: (when?: number) => void } | null = null;
let enabled = true;

const ensureContext = (): AudioContext | null => {
  if (context === null) {
    try {
      context = new AudioContext();
    } catch {
      // Sur un appareil sans sortie audio disponible, le minuteur reste muet
      // mais continue de fonctionner.
      return null;
    }
  }
  return context;
};

const stopActive = (when?: number) => {
  if (active === null) {
    return;
  }
  const previous = active;
  active = null;
  try {
    previous.stop(when);
  } catch {
    // L'oscillateur était déjà arrêté.
  }
};

/**
 * Émet un son. Sans durée, il tient jusqu'à `noTone()` — comme sur Arduino.
 * @param frequency fréquence en hertz
 * @param durationMs durée en millisecondes ; 0 pour un son continu
 */
export function customTone(frequency: number, durationMs = 0) {
  if (!enabled || frequency <= 0) {
    return;
  }
  const ctx = ensureContext();
  if (ctx === null) {
    return;
  }

  stopActive();

  const oscillator = ctx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(VOLUME, now + ATTACK_S);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(now);

  if (durationMs > 0) {
    const end = now + durationMs / 1000;
    const releaseStart = Math.max(now + ATTACK_S, end - RELEASE_S);
    gain.gain.setValueAtTime(VOLUME, releaseStart);
    gain.gain.linearRampToValueAtTime(0, end);
    oscillator.stop(end);
    active = null;
    return;
  }

  active = {
    stop: (when?: number) => {
      const at = when ?? ctx.currentTime;
      gain.gain.cancelScheduledValues(at);
      gain.gain.setValueAtTime(gain.gain.value, at);
      gain.gain.linearRampToValueAtTime(0, at + RELEASE_S);
      oscillator.stop(at + RELEASE_S);
    },
  };
}

/** Coupe le son en cours. */
export function noTone() {
  stopActive();
}

/** Coupe ou rétablit le buzzer — le bouton « mute » du minuteur. */
export function setBuzzerEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    noTone();
  }
}

export function isBuzzerEnabled() {
  return enabled;
}

/** Libère le contexte audio quand l'application passe en arrière-plan. */
export async function releaseBuzzer() {
  noTone();
  if (context !== null) {
    const previous = context;
    context = null;
    try {
      await previous.close();
    } catch {
      // Le contexte était déjà fermé.
    }
  }
}
