import { timerReducer } from '../src/timer/reducer';
import {
  BURNOUT_MS,
  DAY,
  HOUR,
  MAX_MS,
  MINUTE,
  SECOND,
  initialState,
  type TimerState,
} from '../src/timer/types';

/** Raccourci : applique une suite d'actions à partir d'un état donné. */
const run = (start: TimerState, ...actions: Parameters<typeof timerReducer>[1][]) =>
  actions.reduce(timerReducer, start);

const idle = (remainingMs = 0): TimerState => ({
  ...initialState,
  phase: 'idle',
  remainingMs,
});

const setup = (field: TimerState['setupField'], remainingMs = 0): TimerState => ({
  ...initialState,
  phase: 'setup',
  setupField: field,
  remainingMs,
});

describe('alimentation', () => {
  it("passe à l'amorçage depuis l'état éteint", () => {
    expect(timerReducer(initialState, { type: 'POWER' }).phase).toBe('boot');
  });

  it('éteint tout même en plein décompte', () => {
    const running: TimerState = {
      ...initialState,
      phase: 'running',
      remainingMs: 42 * SECOND,
      deadlineAt: Date.now() + 42 * SECOND,
    };
    expect(timerReducer(running, { type: 'POWER' })).toEqual(initialState);
  });

  it("termine l'amorçage sur l'état de repos", () => {
    const booted = run(initialState, { type: 'POWER' }, { type: 'BOOT_DONE' });
    expect(booted.phase).toBe('idle');
  });
});

describe('réglage', () => {
  it('parcourt les champs puis referme le mode réglage', () => {
    let state = idle();
    const seen: (string | null)[] = [];
    for (let i = 0; i < 5; i += 1) {
      state = timerReducer(state, { type: 'FCN' });
      seen.push(state.setupField);
    }
    expect(seen).toEqual(['seconds', 'minutes', 'hours', 'days', null]);
    expect(state.phase).toBe('idle');
  });

  it('ajoute exactement le pas du champ sélectionné', () => {
    const cases = [
      ['seconds', SECOND],
      ['minutes', MINUTE],
      ['hours', HOUR],
      ['days', DAY],
    ] as const;

    cases.forEach(([field, step]) => {
      const next = timerReducer(setup(field), { type: 'ADJUST', direction: 1 });
      expect(next.remainingMs).toBe(step);
    });
  });

  it("ne retire qu'une seconde quand on décrémente les secondes", () => {
    // Régression : l'ancienne version enchaînait les `case` sans `break`,
    // donc décrémenter les secondes retirait aussi minutes, heures et jours.
    const state = setup('seconds', 1 * HOUR + 30 * MINUTE + 10 * SECOND);
    const next = timerReducer(state, { type: 'ADJUST', direction: -1 });
    expect(next.remainingMs).toBe(1 * HOUR + 30 * MINUTE + 9 * SECOND);
  });

  it('ne descend jamais sous zéro', () => {
    const next = timerReducer(setup('hours', 0), { type: 'ADJUST', direction: -1 });
    expect(next.remainingMs).toBe(0);
  });

  it('plafonne à la limite affichable', () => {
    const next = timerReducer(setup('days', MAX_MS), { type: 'ADJUST', direction: 1 });
    expect(next.remainingMs).toBe(MAX_MS);
  });

  it('ignore les réglages hors du mode réglage', () => {
    const state = idle(5 * SECOND);
    expect(timerReducer(state, { type: 'ADJUST', direction: 1 })).toBe(state);
  });
});

describe('décompte', () => {
  it('ne démarre pas sans temps réglé', () => {
    const state = idle(0);
    expect(timerReducer(state, { type: 'END' })).toBe(state);
  });

  it('passe par le saut avant de lancer le décompte', () => {
    const next = timerReducer(idle(10 * SECOND), { type: 'END' });
    expect(next.phase).toBe('slide');
    expect(next.slideIntent).toBe('start');
  });

  it("ancre l'échéance sur l'horloge à la fin du saut", () => {
    const now = 1_700_000_000_000;
    const sliding = timerReducer(idle(10 * SECOND), { type: 'END' });
    const running = timerReducer(sliding, { type: 'SLIDE_DONE', now });
    expect(running.phase).toBe('running');
    expect(running.deadlineAt).toBe(now + 10 * SECOND);
  });

  it("dérive pas : le restant se déduit de l'échéance", () => {
    const now = 1_700_000_000_000;
    const running: TimerState = {
      ...initialState,
      phase: 'running',
      remainingMs: 10 * SECOND,
      deadlineAt: now + 10 * SECOND,
    };
    // Un réveil tardif ne « perd » pas les secondes écoulées.
    const later = timerReducer(running, { type: 'TICK', now: now + 7_200 });
    expect(later.remainingMs).toBe(3 * SECOND);
  });

  it('ne produit un nouvel état que si la seconde affichée change', () => {
    const now = 1_700_000_000_000;
    const running: TimerState = {
      ...initialState,
      phase: 'running',
      remainingMs: 10 * SECOND,
      deadlineAt: now + 10 * SECOND,
    };
    expect(timerReducer(running, { type: 'TICK', now: now + 40 })).toBe(running);
  });

  it('bascule sur le saut à zéro', () => {
    const now = 1_700_000_000_000;
    const running: TimerState = {
      ...initialState,
      phase: 'running',
      remainingMs: SECOND,
      deadlineAt: now,
    };
    const next = timerReducer(running, { type: 'TICK', now });
    expect(next.phase).toBe('slide');
    expect(next.slideIntent).toBe('expire');
    expect(next.remainingMs).toBe(0);
  });

  it('se réamorce après un décompte arrivé à son terme', () => {
    const expired: TimerState = {
      ...initialState,
      phase: 'slide',
      slideIntent: 'expire',
    };
    expect(timerReducer(expired, { type: 'SLIDE_DONE', now: 0 }).phase).toBe('boot');
  });
});

describe('saut anticipé', () => {
  it('interrompt le décompte en cours', () => {
    const running: TimerState = {
      ...initialState,
      phase: 'running',
      remainingMs: 60 * SECOND,
      deadlineAt: Date.now() + 60 * SECOND,
    };
    const next = timerReducer(running, { type: 'END' });
    expect(next.phase).toBe('slide');
    expect(next.slideIntent).toBe('random');
    expect(next.deadlineAt).toBeNull();
  });

  it('repart sur une durée tirée au sort', () => {
    const sliding: TimerState = { ...initialState, phase: 'slide', slideIntent: 'random' };
    const now = 1_700_000_000_000;
    const next = timerReducer(sliding, { type: 'SLIDE_DONE', now, randomMs: 120 * SECOND });
    expect(next.phase).toBe('running');
    expect(next.remainingMs).toBe(120 * SECOND);
    expect(next.deadlineAt).toBe(now + 120 * SECOND);
  });
});

describe('restauration du réglage', () => {
  it('restaure un temps sur un minuteur au repos et vide', () => {
    const next = timerReducer(idle(0), { type: 'HYDRATE', remainingMs: 90 * SECOND });
    expect(next.remainingMs).toBe(90 * SECOND);
  });

  it("n'écrase jamais un réglage déjà saisi", () => {
    const state = idle(30 * SECOND);
    expect(timerReducer(state, { type: 'HYDRATE', remainingMs: 90 * SECOND })).toBe(state);
  });
});

describe('burnout', () => {
  const running = (remainingMs = 60 * SECOND): TimerState => ({
    ...initialState,
    phase: 'running',
    remainingMs,
    deadlineAt: Date.now() + remainingMs,
  });

  const burnout = (remainingMs: number): TimerState => ({
    ...initialState,
    phase: 'burnout',
    remainingMs,
    deadlineAt: Date.now() + remainingMs,
  });

  it('se déclenche depuis un décompte en cours', () => {
    const next = timerReducer(running(), { type: 'VORTEX' });
    expect(next.phase).toBe('slide');
    expect(next.slideIntent).toBe('burnout');
  });

  it('ouvre sur quatre-vingt-dix secondes de sursis', () => {
    const now = 1_700_000_000_000;
    const sliding = timerReducer(running(), { type: 'VORTEX' });
    const next = timerReducer(sliding, { type: 'SLIDE_DONE', now });
    expect(next.phase).toBe('burnout');
    expect(next.remainingMs).toBe(BURNOUT_MS);
    expect(next.deadlineAt).toBe(now + BURNOUT_MS);
  });

  it('tue le minuteur quand le sursis expire', () => {
    const now = 1_700_000_000_000;
    const state: TimerState = {
      ...initialState,
      phase: 'burnout',
      remainingMs: SECOND,
      deadlineAt: now,
    };
    const next = timerReducer(state, { type: 'TICK', now });
    expect(next.phase).toBe('dead');
    expect(next.remainingMs).toBe(0);
  });

  it('ne se rattrape qu’à la toute dernière seconde', () => {
    const early = burnout(30 * SECOND);
    expect(timerReducer(early, { type: 'VORTEX' })).toBe(early);

    const late = burnout(SECOND);
    expect(timerReducer(late, { type: 'VORTEX' }).slideIntent).toBe('reroll');
  });

  it('repart sur une durée tirée au sort après un rattrapage', () => {
    const now = 1_700_000_000_000;
    const sliding: TimerState = { ...initialState, phase: 'slide', slideIntent: 'reroll' };
    const next = timerReducer(sliding, { type: 'SLIDE_DONE', now, randomMs: 500 * SECOND });
    expect(next.phase).toBe('burnout');
    expect(next.remainingMs).toBe(500 * SECOND);
  });

  it('ne laisse que le bouton d’alimentation sur un minuteur mort', () => {
    const dead: TimerState = { ...initialState, phase: 'dead' };
    expect(timerReducer(dead, { type: 'END' })).toBe(dead);
    expect(timerReducer(dead, { type: 'FCN' })).toBe(dead);
    expect(timerReducer(dead, { type: 'VORTEX' })).toBe(dead);
    expect(timerReducer(dead, { type: 'ADJUST', direction: 1 })).toBe(dead);
    expect(timerReducer(dead, { type: 'POWER' })).toEqual(initialState);
  });

  it('ignore le vortex hors décompte', () => {
    const state = idle(10 * SECOND);
    expect(timerReducer(state, { type: 'VORTEX' })).toBe(state);
  });
});
