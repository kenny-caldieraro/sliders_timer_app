import {
  BURNOUT_MS,
  MAX_MS,
  SECOND,
  SETUP_CYCLE,
  STEP_MS,
  initialState,
  type TimerAction,
  type TimerState,
} from './types';

const clamp = (ms: number) => Math.min(Math.max(ms, 0), MAX_MS);

/** Arrondit à la seconde : l'afficheur n'a pas de résolution plus fine. */
const toWholeSeconds = (ms: number) => Math.round(ms / SECOND) * SECOND;

const nextSetupField = (current: TimerState['setupField']) => {
  const index = SETUP_CYCLE.indexOf(current);
  return SETUP_CYCLE[(index + 1) % SETUP_CYCLE.length] ?? null;
};

/**
 * Reducer pur de la machine à états du minuteur.
 *
 * Deux invariants tiennent tout le reste :
 *   1. Aucun effet de bord ici — ni son, ni animation, ni minuterie.
 *      Les effets sont déclenchés par `useTimer` en observant les transitions.
 *   2. Pendant le décompte, `deadlineAt` fait seul autorité. `remainingMs`
 *      n'en est qu'une projection, recalculée à chaque TICK. C'est ce qui
 *      supprime la dérive de l'ancienne version et permet à l'app de
 *      retrouver le bon temps après un passage en arrière-plan.
 */
export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'POWER': {
      if (state.phase === 'off') {
        return { ...initialState, phase: 'boot' };
      }
      // Un bouton d'alimentation doit toujours pouvoir éteindre, y compris
      // en plein décompte : c'est ce qui évite les états bloqués.
      return initialState;
    }

    case 'BOOT_DONE': {
      return state.phase === 'boot' ? { ...state, phase: 'idle' } : state;
    }

    case 'FCN': {
      if (state.phase !== 'idle' && state.phase !== 'setup') {
        return state;
      }
      const setupField = nextSetupField(state.setupField);
      return {
        ...state,
        setupField,
        phase: setupField === null ? 'idle' : 'setup',
      };
    }

    case 'ADJUST': {
      if (state.phase !== 'setup' || state.setupField === null) {
        return state;
      }
      const step = STEP_MS[state.setupField] * action.direction;
      return { ...state, remainingMs: clamp(state.remainingMs + step) };
    }

    case 'END': {
      // Pendant le décompte, END provoque un saut anticipé.
      if (state.phase === 'running') {
        return { ...state, phase: 'slide', slideIntent: 'random', deadlineAt: null };
      }
      // À l'arrêt, END lance le décompte réglé.
      if ((state.phase === 'idle' || state.phase === 'setup') && state.remainingMs > 0) {
        return { ...state, phase: 'slide', slideIntent: 'start', setupField: null };
      }
      return state;
    }

    case 'VORTEX': {
      // En plein décompte : on force le saut, le minuteur bascule en burnout.
      if (state.phase === 'running') {
        return { ...state, phase: 'slide', slideIntent: 'burnout', deadlineAt: null };
      }
      // En burnout, le sursis ne se rattrape qu'à la toute dernière seconde.
      if (state.phase === 'burnout' && state.remainingMs <= SECOND) {
        return { ...state, phase: 'slide', slideIntent: 'reroll', deadlineAt: null };
      }
      return state;
    }

    case 'TICK': {
      const counting = state.phase === 'running' || state.phase === 'burnout';
      if (!counting || state.deadlineAt === null) {
        return state;
      }
      const remainingMs = Math.max(0, state.deadlineAt - action.now);
      if (remainingMs === 0) {
        // Un décompte normal enchaîne sur un saut ; un burnout qui va au bout
        // tue le minuteur.
        return state.phase === 'burnout'
          ? { ...state, phase: 'dead', remainingMs: 0, deadlineAt: null, slideIntent: null }
          : {
              ...state,
              phase: 'slide',
              slideIntent: 'expire',
              remainingMs: 0,
              deadlineAt: null,
            };
      }
      const rounded = toWholeSeconds(remainingMs);
      // On ne remplace l'objet que si la seconde affichée change,
      // pour ne pas re-rendre l'interface 60 fois par seconde.
      return rounded === state.remainingMs ? state : { ...state, remainingMs: rounded };
    }

    case 'SLIDE_DONE': {
      if (state.phase !== 'slide') {
        return state;
      }
      switch (state.slideIntent) {
        case 'start':
          return {
            ...state,
            phase: 'running',
            slideIntent: null,
            deadlineAt: action.now + state.remainingMs,
          };
        case 'random': {
          const remainingMs = clamp(toWholeSeconds(action.randomMs ?? 0));
          if (remainingMs === 0) {
            return { ...state, phase: 'idle', slideIntent: null, remainingMs: 0 };
          }
          return {
            ...state,
            phase: 'running',
            slideIntent: null,
            remainingMs,
            deadlineAt: action.now + remainingMs,
          };
        }
        case 'burnout':
          return {
            ...state,
            phase: 'burnout',
            slideIntent: null,
            remainingMs: BURNOUT_MS,
            deadlineAt: action.now + BURNOUT_MS,
          };
        case 'reroll': {
          const remainingMs = clamp(toWholeSeconds(action.randomMs ?? 0));
          return {
            ...state,
            phase: 'burnout',
            slideIntent: null,
            remainingMs,
            deadlineAt: action.now + remainingMs,
          };
        }
        case 'expire':
        default:
          // Arrivé à zéro, le minuteur se réamorce — comme dans la série.
          return { ...initialState, phase: 'boot' };
      }
    }

    case 'HYDRATE': {
      // On ne restaure un réglage que sur un minuteur au repos.
      if (state.phase !== 'idle' || state.remainingMs !== 0) {
        return state;
      }
      return { ...state, remainingMs: clamp(toWholeSeconds(action.remainingMs)) };
    }

    default:
      return state;
  }
}
