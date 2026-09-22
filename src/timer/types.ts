export const SECOND = 1_000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** 999 jours 23:59:59 — la limite que l'afficheur peut représenter. */
export const MAX_MS = 1000 * DAY - SECOND;

/** Attente écrans noirs au début du clip d'activation (START_INTRO_DELAY_MS). */
export const BOOT_INTRO_DELAY_MS = 2500;

/** Attente de fin de clip après l'animation d'amorçage (START_OUTRO_DELAY_MS). */
export const BOOT_OUTRO_DELAY_MS = 2500;

/** Plafond du saut aléatoire, repris de VORTEX_RANDOM_MAX (~193 jours). */
export const RANDOM_MAX_SECONDS = 16_756_131;

/** Durée du mode burnout, fixée à 90 s dans le firmware. */
export const BURNOUT_MS = 90 * SECOND;

export type Phase =
  /** Éteint : les afficheurs sont noirs. */
  | 'off'
  /** Séquence d'amorçage au démarrage. */
  | 'boot'
  /** Allumé, à l'arrêt, prêt à être réglé. */
  | 'idle'
  /** Réglage d'un champ, qui clignote. */
  | 'setup'
  /** Décompte en cours. */
  | 'running'
  /** Transition : flash blanc + son de saut. */
  | 'slide'
  /** Burnout : compte à rebours de secours après un saut forcé. */
  | 'burnout'
  /** Le minuteur est mort : le burnout est allé au bout. */
  | 'dead';

export type SetupField = 'seconds' | 'minutes' | 'hours' | 'days';

/** Ce qui doit se produire une fois le slide terminé. */
export type SlideIntent =
  /** Le décompte réglé démarre. */
  | 'start'
  /** Le décompte est arrivé à zéro : le minuteur se réamorce. */
  | 'expire'
  /** Saut anticipé : un nouveau décompte aléatoire est tiré. */
  | 'random'
  /** Bascule en burnout : quatre-vingt-dix secondes de sursis. */
  | 'burnout'
  /** Sursis rattrapé in extremis : le burnout repart sur une durée tirée au sort. */
  | 'reroll';

export type TimerState = {
  phase: Phase;
  /**
   * Temps restant en millisecondes.
   * Fait autorité hors décompte ; recalculé depuis `deadlineAt` pendant.
   */
  remainingMs: number;
  /**
   * Instant d'expiration (epoch ms), seule source de vérité pendant le décompte.
   * C'est ce qui empêche la dérive et permet de survivre à une mise en arrière-plan.
   */
  deadlineAt: number | null;
  /** Champ en cours de réglage ; `null` hors mode réglage. */
  setupField: SetupField | null;
  /** Raison du slide en cours. */
  slideIntent: SlideIntent | null;
};

export type TimerAction =
  /** Bouton PWR. */
  | { type: 'POWER' }
  /** La séquence d'amorçage est terminée. */
  | { type: 'BOOT_DONE' }
  /** Bouton FCN : passe au champ suivant. */
  | { type: 'FCN' }
  /** Boutons 1 / 4 : incrémente ou décrémente le champ sélectionné. */
  | { type: 'ADJUST'; direction: 1 | -1 }
  /** Bouton END. */
  | { type: 'END' }
  /** Bouton VORTEX : force le saut, puis le burnout. */
  | { type: 'VORTEX' }
  /** Battement d'horloge pendant le décompte. */
  | { type: 'TICK'; now: number }
  /**
   * Le son et l'animation de slide sont terminés.
   * `randomMs` n'est lu que pour un slide anticipé — passé en argument
   * pour que le reducer reste une fonction pure.
   */
  | { type: 'SLIDE_DONE'; now: number; randomMs?: number }
  /** Restaure un réglage sauvegardé. */
  | { type: 'HYDRATE'; remainingMs: number };

export const STEP_MS: Record<SetupField, number> = {
  seconds: SECOND,
  minutes: MINUTE,
  hours: HOUR,
  days: DAY,
};

/** Ordre de parcours du bouton FCN ; `null` ferme le mode réglage. */
export const SETUP_CYCLE: readonly (SetupField | null)[] = [
  'seconds',
  'minutes',
  'hours',
  'days',
  null,
];

export const initialState: TimerState = {
  phase: 'off',
  remainingMs: 0,
  deadlineAt: null,
  setupField: null,
  slideIntent: null,
};
