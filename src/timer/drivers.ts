import { useEffect, useRef } from 'react';

import {
  BARGRAPH_END,
  BARGRAPH_NORMAL,
  BARGRAPH_POST_END,
  type BargraphFrame,
} from '../animations/frames';
import {
  createToken,
  playCountdownEnd,
  playDisplayFade,
  playDisplayWrap,
  playGenser,
  playSecondTick,
  playVortex,
  playWormholeOpening,
  playWrapBurnout,
  runSequence,
  sleep,
} from '../animations/player';
import { TONES, customTone, noTone } from '../audio/buzzer';
import { playClip, stopAllClips } from '../audio/clips';
import { applyBeepPattern, patternForRemaining, stopBeepPattern } from '../audio/patterns';
import { clearAll, reverseBits, setLed, setRow } from '../hardware/display';
import {
  BARGRAPH_LEFT,
  BARGRAPH_RIGHT,
  BLINK_INTERVALS,
  DAY_DIGITS,
  EMITTER_ROW,
  HOURS,
  MINUTES,
  SECONDS,
} from '../hardware/layout';
import { setColons, setEdges, setEmitter, setStatusLed, showTime } from '../hardware/render';
import {
  IDLE_BRIGHTNESS,
  IDLE_PERIOD_MS,
  RUNNING_BRIGHTNESS,
  breathe,
  clearStrip,
  periodForRemaining,
  releaseLevel,
  setBrightness,
} from '../hardware/strip';
import { remainingSeconds } from './format';
import {
  BOOT_INTRO_DELAY_MS,
  BOOT_OUTRO_DELAY_MS,
  RANDOM_MAX_SECONDS,
  SECOND,
  type Phase,
  type SetupField,
  type TimerAction,
  type TimerState,
} from './types';

type Dispatch = (action: TimerAction) => void;

/**
 * Pilotes du minuteur.
 *
 * Chacun observe une facette de l'état et écrit dans le matériel simulé.
 * Aucun n'appelle `setState` sur le composant racine : c'est ce découpage qui
 * permet aux animations de tourner sans re-rendre l'interface entière.
 */

/** Les deux phases où le temps défile. */
const isCounting = (phase: Phase) => phase === 'running' || phase === 'burnout';

/** Phases où le minuteur est sous tension et affiche l'heure. */
const isPowered = (phase: Phase) =>
  phase === 'idle' || phase === 'setup' || phase === 'running' || phase === 'burnout';

/* ------------------------------------------------------------------ */
/* Amorçage                                                            */
/* ------------------------------------------------------------------ */

/**
 * Séquence d'allumage, reprise de `normal()` au premier double-clic power :
 * clip d'activation au premier allumage, GENSER, puis l'effet « wrap ».
 *
 * Le firmware fait d'abord défiler « sliders timer replica by kenny v1.2 »
 * sur les afficheurs. C'est retiré ici : l'écran de titre casse l'illusion de
 * l'objet, qui doit s'allumer comme un appareil, pas comme un logiciel.
 * Le texte et son défilement restent disponibles dans `animations/frames.ts`.
 */
export function useBootSequence(state: TimerState, dispatch: Dispatch) {
  const isFirstBoot = useRef(true);

  // Le temps réglé est lu à la toute fin de la séquence. On le garde dans une
  // référence pour que la séquence ne redémarre pas s'il change entre-temps.
  const remainingRef = useRef(state.remainingMs);
  useEffect(() => {
    remainingRef.current = state.remainingMs;
  }, [state.remainingMs]);

  useEffect(() => {
    if (state.phase !== 'boot') {
      return;
    }
    const token = createToken();

    runSequence(async () => {
      setColons(false);
      setEdges(false);
      clearStrip();

      if (isFirstBoot.current) {
        isFirstBoot.current = false;
        playClip('activation');
        await sleep(BOOT_INTRO_DELAY_MS, token);
      }

      await playGenser(token);
      await playDisplayWrap(token);
      await sleep(BOOT_OUTRO_DELAY_MS, token);

      clearAll();
      showTime(remainingRef.current);
      setEdges(true);
      setColons(true);
      dispatch({ type: 'BOOT_DONE' });
    });

    return () => {
      token.cancelled = true;
    };
  }, [state.phase, dispatch]);
}

/* ------------------------------------------------------------------ */
/* Saut                                                                */
/* ------------------------------------------------------------------ */

/**
 * Transition de saut.
 *
 * Deux familles : le saut proprement dit, qui joue le vortex sur les huit
 * secondes du clip ; et le passage en burnout, qui éteint les afficheurs
 * puis relance la séquence d'amorçage, comme le fait le firmware avant
 * `reveille(false)`.
 */
export function useSlideSequence(state: TimerState, dispatch: Dispatch) {
  useEffect(() => {
    if (state.phase !== 'slide') {
      return;
    }
    const token = createToken();
    const intent = state.slideIntent;
    const forced = intent === 'burnout' || intent === 'reroll';

    runSequence(async () => {
      stopBeepPattern();

      if (forced) {
        playClip('slide');
        setEmitter([true, true, true, true]);
        customTone(TONES.lock, 1000);
        await sleep(1500, token);
        setEmitter([false, false, false, false]);
        noTone();

        await playDisplayFade(token);
        await playGenser(token);
        await playDisplayWrap(token);
      } else {
        // LED de l'émetteur, puis bip de verrouillage de 1,5 s avant le clip.
        setEmitter([false, true, true, false]);
        customTone(TONES.lock, 1500);
        await sleep(1500, token);
        setEmitter([false, false, false, false]);

        playClip('slide');
        await playVortex(token);

        if (intent === 'expire') {
          await playCountdownEnd(token);
        }
      }

      dispatch({
        type: 'SLIDE_DONE',
        now: Date.now(),
        randomMs: Math.floor(Math.random() * RANDOM_MAX_SECONDS) * SECOND,
      });
    });

    return () => {
      token.cancelled = true;
      noTone();
    };
  }, [state.phase, state.slideIntent, dispatch]);
}

/* ------------------------------------------------------------------ */
/* Minuteur mort                                                       */
/* ------------------------------------------------------------------ */

/**
 * Fin de burnout : ouverture du vortex, puis le tracé de `wrapBurnout` en
 * boucle. Le minuteur ne répond plus qu'au bouton d'alimentation.
 */
export function useDeadState(state: TimerState) {
  useEffect(() => {
    if (state.phase !== 'dead') {
      return;
    }
    const token = createToken();

    runSequence(async () => {
      stopBeepPattern();
      noTone();
      setColons(false);
      setEdges(false);
      setEmitter([false, false, false, false]);
      setStatusLed('TAU', false);
      setStatusLed('DELTA', false);
      setStatusLed('ZETA', false);
      setRow(BARGRAPH_LEFT.matrix, BARGRAPH_LEFT.row, 0);
      setRow(BARGRAPH_RIGHT.matrix, BARGRAPH_RIGHT.row, 0);

      await playWormholeOpening(token);
      playClip('activation');

      for (;;) {
        await playWrapBurnout(token);
      }
    });

    return () => {
      token.cancelled = true;
    };
  }, [state.phase]);
}

/* ------------------------------------------------------------------ */
/* Décompte                                                            */
/* ------------------------------------------------------------------ */

/**
 * Battement du décompte.
 *
 * On interroge l'horloge dix fois par seconde, mais le reducer ne produit un
 * nouvel état que lorsque la seconde affichée change. C'est `deadlineAt` qui
 * fait foi, donc le décompte ne dérive pas et retrouve la bonne valeur après
 * un passage en arrière-plan.
 */
export function useCountdownTick(state: TimerState, dispatch: Dispatch) {
  useEffect(() => {
    if (!isCounting(state.phase)) {
      return;
    }
    const id = setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 100);
    return () => clearInterval(id);
  }, [state.phase, dispatch]);
}

/** Écrit l'heure, précédée du brouillage des secondes pendant le décompte. */
export function useTimeDisplay(state: TimerState) {
  useEffect(() => {
    if (state.phase === 'off' || state.phase === 'boot' || state.phase === 'slide') {
      return;
    }
    if (!isCounting(state.phase)) {
      showTime(state.remainingMs);
      return;
    }

    const token = createToken();
    runSequence(async () => {
      await playSecondTick(token);
      showTime(state.remainingMs);
    });

    return () => {
      token.cancelled = true;
      // Le brouillage ne doit jamais rester figé à l'écran.
      showTime(state.remainingMs);
    };
  }, [state.phase, state.remainingMs]);
}

/* ------------------------------------------------------------------ */
/* Réglage                                                             */
/* ------------------------------------------------------------------ */

/** Afficheur des unités de chaque champ, celui que `handleMenu` fait clignoter. */
const SETUP_TARGET: Record<SetupField, { matrix: 0 | 1; row: number }> = {
  seconds: SECONDS.units,
  minutes: MINUTES.units,
  hours: HOURS.units,
  days: DAY_DIGITS[2]!,
};

/** Clignotement du champ en cours de réglage : 500 ms visible, 250 ms éteint. */
export function useSetupBlink(state: TimerState) {
  useEffect(() => {
    if (state.phase !== 'setup' || state.setupField === null) {
      return;
    }
    const target = SETUP_TARGET[state.setupField];
    let timeout: ReturnType<typeof setTimeout>;

    const show = () => {
      showTime(state.remainingMs);
      timeout = setTimeout(hide, 500);
    };
    const hide = () => {
      setRow(target.matrix, target.row, 0);
      timeout = setTimeout(show, 250);
    };

    show();
    return () => {
      clearTimeout(timeout);
      showTime(state.remainingMs);
    };
  }, [state.phase, state.setupField, state.remainingMs]);
}

/* ------------------------------------------------------------------ */
/* Témoins                                                             */
/* ------------------------------------------------------------------ */

/** Témoins forcés au fixe, selon le palier atteint en burnout. */
type SolidFlags = { TAU: boolean; DELTA: boolean; ZETA: boolean };

const NONE: SolidFlags = { TAU: false, DELTA: false, ZETA: false };

/**
 * En burnout, `animation_burnout` fige certains témoins au lieu de les faire
 * clignoter : c'est ce qui signale visuellement le palier franchi.
 */
function solidFlagsFor(state: TimerState): SolidFlags {
  if (state.phase !== 'burnout') {
    return NONE;
  }
  const seconds = remainingSeconds(state);
  return {
    ZETA: seconds >= 35 && seconds <= 59,
    TAU: seconds >= 15 && seconds <= 35,
    DELTA: seconds <= 15,
  };
}

/**
 * Clignotement des témoins et des séparateurs.
 *
 * Les quatre périodes viennent des structures `LED` du firmware. Elles sont
 * volontairement premières entre elles : c'est ce décalage qui empêche l'objet
 * de paraître synchronisé, donc artificiel.
 *
 * Les paliers du burnout passent par une référence plutôt que par les
 * dépendances de l'effet : relancer les minuteries à chaque seconde casserait
 * précisément ce décalage.
 */
export function useStatusBlinkers(state: TimerState) {
  const active = isCounting(state.phase);
  const solid = useRef<SolidFlags>(NONE);

  useEffect(() => {
    solid.current = solidFlagsFor(state);
  }, [state]);

  useEffect(() => {
    if (!active) {
      setStatusLed('TAU', false);
      setStatusLed('DELTA', false);
      setStatusLed('ZETA', false);
      return;
    }

    const flags = { TAU: false, DELTA: false, ZETA: false };

    const tick = (key: keyof SolidFlags, apply: (on: boolean) => void) => () => {
      if (solid.current[key]) {
        apply(true);
        return;
      }
      flags[key] = !flags[key];
      apply(flags[key]);
    };

    const ids = [
      setInterval(
        tick('DELTA', (on) => setStatusLed('DELTA', on)),
        BLINK_INTERVALS.red,
      ),
      setInterval(
        tick('TAU', (on) => setStatusLed('TAU', on)),
        BLINK_INTERVALS.yellow,
      ),
      setInterval(
        tick('ZETA', (on) => setStatusLed('ZETA', on)),
        BLINK_INTERVALS.green,
      ),
    ];

    return () => ids.forEach(clearInterval);
  }, [active]);
}

/**
 * Battement des deux-points : deux fois par seconde dès que le minuteur est
 * allumé. C'est le signe le plus simple que l'objet est vivant, donc il ne
 * s'arrête pas entre deux décomptes.
 *
 * Sous cinq secondes de burnout, ils passent au fixe — le firmware fige alors
 * tous les témoins.
 */
export function useColonBlink(state: TimerState) {
  const powered = isPowered(state.phase);
  const solid = useRef(false);

  useEffect(() => {
    solid.current = state.phase === 'burnout' && remainingSeconds(state) <= 5;
  }, [state]);

  useEffect(() => {
    if (!powered) {
      setColons(false);
      return;
    }
    let on = true;
    setColons(true);

    const id = setInterval(() => {
      if (solid.current) {
        setColons(true);
        return;
      }
      on = !on;
      setColons(on);
    }, BLINK_INTERVALS.colon);

    return () => {
      clearInterval(id);
      setColons(false);
    };
  }, [powered]);
}

/* ------------------------------------------------------------------ */
/* Bargraphes                                                          */
/* ------------------------------------------------------------------ */

/**
 * Table de bargraphe correspondant au moment du décompte.
 * Le décompte normal garde la même ; le burnout en change à chaque palier.
 */
function bargraphTableFor(state: TimerState) {
  if (state.phase !== 'burnout') {
    return BARGRAPH_POST_END;
  }
  const seconds = remainingSeconds(state);
  if (seconds <= 30) {
    return BARGRAPH_END;
  }
  if (seconds <= 59) {
    return BARGRAPH_POST_END;
  }
  return BARGRAPH_NORMAL;
}

/**
 * Segments d'extrémité d'un bargraphe : colonnes 0 et 7, soit les bits de
 * poids fort et faible du registre.
 */
const REST_PATTERN = 0x81;

/**
 * Surcoût d'un tour de boucle Arduino.
 *
 * `animateBargraphe` attend `delayTime`, mais la boucle principale fait aussi
 * son propre `delay(10)` et tout le reste du travail entre deux images :
 * lecture des boutons, `showTime`, potentiomètre, clignotements. La cadence
 * réelle sur l'objet est donc nettement plus lente que la valeur nominale, et
 * la reproduire à la lettre donne un défilement bien trop nerveux.
 */
const LOOP_OVERHEAD_MS = 35;

/**
 * Animation des deux bargraphes.
 *
 * L'image est choisie par le temps écoulé plutôt qu'incrémentée à chaque
 * réveil : la cadence reste juste même si une image est sautée, et on ne
 * dépasse jamais la fréquence d'affichage.
 */
export function useBargraph(state: TimerState) {
  const active = isCounting(state.phase);
  const powered = isPowered(state.phase);
  const table = bargraphTableFor(state);

  useEffect(() => {
    if (!active) {
      // Au repos, les deux segments d'extrémité restent allumés : c'est le
      // témoin « sous tension » de la façade. Éteindre complètement les
      // gouttières donnerait un objet mort alors qu'il attend un réglage.
      const resting = powered ? REST_PATTERN : 0;
      setRow(BARGRAPH_LEFT.matrix, BARGRAPH_LEFT.row, resting);
      setRow(BARGRAPH_RIGHT.matrix, BARGRAPH_RIGHT.row, resting);
      return;
    }

    const frameMs = table.delayMs + LOOP_OVERHEAD_MS;
    const start = Date.now();
    let raf: ReturnType<typeof requestAnimationFrame>;

    const step = () => {
      const index = Math.floor((Date.now() - start) / frameMs) % table.frames.length;
      const frame = table.frames[index] as BargraphFrame | undefined;
      if (frame) {
        // `displayImage` écrit ces octets colonne par colonne : le bit 0 part
        // sur la colonne 0, qui est le bit de poids fort du registre.
        setRow(BARGRAPH_LEFT.matrix, BARGRAPH_LEFT.row, reverseBits(frame[0]));
        setRow(BARGRAPH_RIGHT.matrix, BARGRAPH_RIGHT.row, reverseBits(frame[1]));
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, powered, table]);
}

/* ------------------------------------------------------------------ */
/* Son                                                                 */
/* ------------------------------------------------------------------ */

/** Applique le palier sonore correspondant au temps restant. */
export function useBeeps(state: TimerState) {
  useEffect(() => {
    if (!isCounting(state.phase)) {
      stopBeepPattern();
      return;
    }
    applyBeepPattern(patternForRemaining(remainingSeconds(state)));
  }, [state]);

  useEffect(() => () => stopBeepPattern(), []);
}

/* ------------------------------------------------------------------ */
/* Bandeau et émetteur                                                 */
/* ------------------------------------------------------------------ */

/** Respiration du bandeau : lente au repos, de plus en plus pressée ensuite. */
export function useStripPulse(state: TimerState) {
  useEffect(() => {
    if (state.phase === 'off' || state.phase === 'slide' || state.phase === 'dead') {
      return;
    }

    const counting = isCounting(state.phase);
    const period = counting ? periodForRemaining(remainingSeconds(state)) : IDLE_PERIOD_MS;
    const range = counting ? RUNNING_BRIGHTNESS : IDLE_BRIGHTNESS;
    const start = Date.now();
    let raf: ReturnType<typeof requestAnimationFrame>;

    // La respiration ne joue que sur la luminosité : le nombre de segments
    // allumés reste celui du potentiomètre, comme dans `pulseNeoPixel`.
    releaseLevel();

    const step = () => {
      setBrightness(breathe(Date.now() - start, period, range.min, range.max));
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [state]);
}

/** LED de l'émetteur dans les six dernières secondes, comme `animation_normal`. */
export function useEmitter(state: TimerState) {
  useEffect(() => {
    const off = () => {
      setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 2, false);
      setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 3, false);
    };

    if (state.phase !== 'running') {
      off();
      return;
    }
    const remaining = remainingSeconds(state);
    if (remaining > 6) {
      off();
      return;
    }
    if (remaining <= 2) {
      setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 2, true);
      setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 3, true);
      return;
    }
    // 6 et 4 : colonne 2 ; 5 et 3 : colonne 3.
    const left = remaining % 2 === 0;
    setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 2, left);
    setLed(EMITTER_ROW.matrix, EMITTER_ROW.row, 3, !left);
  }, [state]);
}

/* ------------------------------------------------------------------ */
/* Extinction                                                          */
/* ------------------------------------------------------------------ */

/** Éteint tout quand le minuteur est hors tension. */
export function usePowerState(state: TimerState) {
  useEffect(() => {
    if (state.phase !== 'off') {
      return;
    }
    stopBeepPattern();
    stopAllClips();
    noTone();
    clearAll();
    clearStrip();
  }, [state.phase]);
}
