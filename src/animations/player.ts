import { TONES, customTone, noTone } from '../audio/buzzer';
import { clearDisplay, setDigit, setRow, setRows } from '../hardware/display';
import {
  BARGRAPH_LEFT,
  BARGRAPH_RIGHT,
  NEOPIXEL_COUNT,
  SECONDS,
} from '../hardware/layout';
import { releaseLevel, setBrightness, setLevel } from '../hardware/strip';
import {
  DISPLAY_FADE_FRAMES,
  DISPLAY_WRAP_FRAMES,
  GENSER_FRAMES,
  GENSER_TONE,
  WRAP_BURNOUT_FRAMES,
  WRAP_BURNOUT_FRAME_MS,
  WRAP_BURNOUT_M1,
  type AnimFrame,
} from './frames';

/**
 * Lecteur des séquences portées du firmware.
 *
 * Chaque séquence écrit dans les matrices exactement comme le fait l'Arduino,
 * et s'interrompt proprement : toutes prennent un jeton d'annulation, parce qu'une
 * animation doit pouvoir être coupée net si l'utilisateur éteint le minuteur.
 */

export class AbortedError extends Error {
  constructor() {
    super('Séquence interrompue');
    this.name = 'AbortedError';
  }
}

/**
 * Jeton d'annulation d'une séquence.
 *
 * On n'utilise pas `AbortController` : son implémentation dépend des polyfills
 * de React Native, alors qu'un objet mutable d'un seul champ suffit ici et se
 * comporte de la même façon sur toutes les plateformes.
 */
export type CancelToken = { cancelled: boolean };

export const createToken = (): CancelToken => ({ cancelled: false });

/** Attente interruptible — l'équivalent de `delay()` côté Arduino. */
export function sleep(ms: number, token: CancelToken): Promise<void> {
  return new Promise((resolve, reject) => {
    if (token.cancelled) {
      reject(new AbortedError());
      return;
    }
    setTimeout(() => {
      if (token.cancelled) {
        reject(new AbortedError());
      } else {
        resolve();
      }
    }, ms);
  });
}

/** Exécute une séquence en absorbant l'interruption. */
export async function runSequence(task: () => Promise<void>): Promise<boolean> {
  try {
    await task();
    return true;
  } catch (error) {
    if (error instanceof AbortedError) {
      return false;
    }
    throw error;
  }
}

/** Joue une suite d'images génériques : segments, son, temps de pose. */
export async function playAnimFrames(frames: readonly AnimFrame[], token: CancelToken) {
  for (const frame of frames) {
    if (frame.toneFreq) {
      customTone(frame.toneFreq, frame.toneDur);
    }
    setRows(0, frame.r0);
    setRows(1, frame.r1);
    if (frame.delayMs) {
      await sleep(frame.delayMs, token);
    }
  }
}

/** Séquence d'amorçage : GENSER, CALURI, KENNY, entrecoupés de brouillage. */
export async function playGenser(token: CancelToken) {
  for (const frame of GENSER_FRAMES) {
    setRows(0, frame.r0);
    setRows(1, frame.r1);
    customTone(GENSER_TONE.freq, GENSER_TONE.durMs);
    await sleep(frame.holdMs, token);
    clearDisplay(0);
    clearDisplay(1);
    noTone();
    await sleep(frame.clearPauseMs, token);
  }
}

/** Fondu de sortie des afficheurs. */
export async function playDisplayFade(token: CancelToken) {
  await sleep(100, token);
  await playAnimFrames(DISPLAY_FADE_FRAMES, token);
  await sleep(1000, token);
}

/** Effet « wrap » : balayage de segments avec tons descendants. */
export async function playDisplayWrap(token: CancelToken) {
  await sleep(30, token);
  await playAnimFrames(DISPLAY_WRAP_FRAMES, token);
}

/** Tracé progressif de fin de burnout. */
export async function playWrapBurnout(token: CancelToken) {
  setRow(1, 0, WRAP_BURNOUT_M1.r0);
  setRow(1, 1, WRAP_BURNOUT_M1.r1);
  setRow(1, 2, WRAP_BURNOUT_M1.r2);
  setRow(1, 3, WRAP_BURNOUT_M1.r3);
  setRow(1, 4, WRAP_BURNOUT_M1.r4);
  setRow(1, 6, WRAP_BURNOUT_M1.r6);

  for (const frame of WRAP_BURNOUT_FRAMES) {
    setRows(0, frame);
    await sleep(WRAP_BURNOUT_FRAME_MS, token);
  }
}

/** Segments parcourus par la rotation du vortex : A, B, C, D, E, F. */
const ROTATION_SEGMENTS = [0x40, 0x20, 0x10, 0x08, 0x04, 0x02] as const;

const VORTEX_DURATION_MS = 8000;
const VORTEX_CLIMAX_AT_MS = 6000;

/**
 * Animation du vortex, calée sur les huit secondes du clip sonore.
 * Phase 1 : rotation de segments qui accélère de 100 à 25 ms, bargraphes qui
 * se remplissent, bandeau qui monte. Phase 2 : flashs à 80 ms.
 */
export async function playVortex(token: CancelToken) {
  const start = Date.now();
  let step = 0;

  for (;;) {
    const elapsed = Date.now() - start;
    if (elapsed >= VORTEX_DURATION_MS) {
      break;
    }

    if (elapsed < VORTEX_CLIMAX_AT_MS) {
      const segment = ROTATION_SEGMENTS[step % ROTATION_SEGMENTS.length]!;
      for (let row = 0; row < 6; row += 1) {
        setRow(0, row, segment);
      }
      for (let row = 0; row < 3; row += 1) {
        setRow(1, row, segment);
      }

      const fill = Math.min(Math.floor(elapsed / 750), 8);
      const bar = fill >= 8 ? 0xff : (1 << fill) - 1;
      setRow(BARGRAPH_LEFT.matrix, BARGRAPH_LEFT.row, bar);
      setRow(BARGRAPH_RIGHT.matrix, BARGRAPH_RIGHT.row, bar);

      setLevel(Math.min(Math.floor(elapsed / 800) + 1, NEOPIXEL_COUNT));
      setBrightness(Math.min(20 + Math.floor(elapsed / 200), 60));

      await sleep(Math.max(100 - Math.floor(elapsed / 80), 25), token);
      step += 1;
    } else {
      const on = (Math.floor(elapsed / 80) & 1) !== 0;
      for (let row = 0; row < 6; row += 1) {
        setRow(0, row, on ? 0x7f : 0x00);
      }
      for (let row = 0; row < 5; row += 1) {
        setRow(1, row, on ? 0xff : 0x00);
      }
      setLevel(on ? NEOPIXEL_COUNT : 0);
      setBrightness(80);
      await sleep(60, token);
    }
  }

  clearDisplay(0);
  clearDisplay(1);
  releaseLevel();
  setBrightness(0);
}

/** Alarme de fin de décompte : huit flashs à 2500 Hz. */
export async function playCountdownEnd(token: CancelToken) {
  for (let i = 0; i < 8; i += 1) {
    for (let row = 0; row < 6; row += 1) {
      setRow(0, row, 0x7f);
    }
    for (let row = 0; row < 5; row += 1) {
      setRow(1, row, 0xff);
    }
    setLevel(NEOPIXEL_COUNT);
    setBrightness(80);
    customTone(TONES.alarm, 100);
    await sleep(150, token);

    clearDisplay(0);
    clearDisplay(1);
    setBrightness(0);
    noTone();
    await sleep(150, token);
  }
  releaseLevel();
  noTone();
}

/** Montée des segments de l'ouverture du vortex. */
const WORMHOLE_BUILD_UP = [0x40, 0x60, 0x70, 0x71, 0x77, 0x7f] as const;

/** Ouverture du vortex : convergence, flashs, extinction. */
export async function playWormholeOpening(token: CancelToken) {
  for (let step = 0; step < WORMHOLE_BUILD_UP.length; step += 1) {
    const pattern = WORMHOLE_BUILD_UP[step]!;
    for (let row = 0; row < 6; row += 1) {
      setRow(0, row, pattern);
    }
    for (let row = 0; row < 5; row += 1) {
      setRow(1, row, pattern);
    }
    setLevel(NEOPIXEL_COUNT);
    setBrightness(20 + step * 10);
    await sleep(200, token);
  }

  for (let i = 0; i < 4; i += 1) {
    for (let row = 0; row < 6; row += 1) {
      setRow(0, row, 0xff);
    }
    for (let row = 0; row < 5; row += 1) {
      setRow(1, row, 0xff);
    }
    setBrightness(100);
    await sleep(80, token);

    for (let row = 0; row < 6; row += 1) {
      setRow(0, row, 0x00);
    }
    for (let row = 0; row < 5; row += 1) {
      setRow(1, row, 0x00);
    }
    setBrightness(0);
    await sleep(80, token);
  }

  for (let brightness = 100; brightness >= 0; brightness -= 10) {
    setLevel(NEOPIXEL_COUNT);
    setBrightness(brightness);
    await sleep(50, token);
  }
  releaseLevel();
  setBrightness(0);
}

/** Brouillage bref des deux afficheurs de secondes, à chaque battement. */
export async function playSecondTick(token: CancelToken) {
  for (let i = 0; i < 3; i += 1) {
    setDigit(SECONDS.tens.matrix, SECONDS.tens.row, Math.floor(Math.random() * 10));
    setDigit(SECONDS.units.matrix, SECONDS.units.row, Math.floor(Math.random() * 10));
    await sleep(15, token);
  }
}
