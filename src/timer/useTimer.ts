import { useEffect, useMemo, useReducer } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { initClips, stopAllClips } from '../audio/clips';
import { noTone } from '../audio/buzzer';
import { stopBeepPattern } from '../audio/patterns';
import { usePersistedTime } from '../hooks/usePersistedTime';
import { cancelTimerEnd, scheduleTimerEnd } from '../notifications';
import {
  useBargraph,
  useBeeps,
  useBootSequence,
  useCountdownTick,
  useDeadState,
  useEmitter,
  usePowerState,
  useSetupBlink,
  useSlideSequence,
  useStatusBlinkers,
  useStripPulse,
  useTimeDisplay,
} from './drivers';
import { timerReducer } from './reducer';
import { initialState, type TimerState } from './types';

export type TimerActions = {
  /** Bouton PWR. */
  power: () => void;
  /** Bouton FCN : passe au champ de réglage suivant. */
  selectField: () => void;
  /** Bouton « 1 ». */
  increase: () => void;
  /** Bouton « 4 ». */
  decrease: () => void;
  /** Bouton END. */
  end: () => void;
  /** Bouton VORTEX : force le saut, puis le burnout. */
  vortex: () => void;
};

export type Timer = {
  state: TimerState;
  actions: TimerActions;
};

/**
 * Assemble la machine à états et les pilotes matériels.
 *
 * Le composant racine ne connaît que `state.phase` et les cinq actions :
 * toutes les animations passent par les magasins de `hardware/`, donc elles
 * ne provoquent aucun rendu au-dessus des afficheurs concernés.
 */
export function useTimer(): Timer {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  useEffect(() => {
    initClips();
  }, []);

  useBootSequence(state, dispatch);
  useSlideSequence(state, dispatch);
  useDeadState(state);
  useCountdownTick(state, dispatch);
  useTimeDisplay(state);
  useSetupBlink(state);
  useStatusBlinkers(state);
  useBargraph(state);
  useBeeps(state);
  useStripPulse(state);
  useEmitter(state);
  usePowerState(state);
  usePersistedTime(state, dispatch);

  // Écran maintenu allumé pendant le décompte : un minuteur qu'on regarde
  // n'a pas à s'éteindre au bout de trente secondes.
  useEffect(() => {
    if (state.phase !== 'running' && state.phase !== 'burnout') {
      return;
    }
    activateKeepAwakeAsync('countdown').catch(() => undefined);
    return () => {
      deactivateKeepAwake('countdown').catch(() => undefined);
    };
  }, [state.phase]);

  // Notification de fin, reprogrammée à chaque changement d'échéance.
  useEffect(() => {
    if (state.phase === 'running' && state.deadlineAt !== null) {
      scheduleTimerEnd(state.deadlineAt, state.remainingMs);
      return;
    }
    cancelTimerEnd();
  }, [state.phase, state.deadlineAt, state.remainingMs]);

  // Retour d'arrière-plan : on recale immédiatement sur l'échéance, sans
  // attendre le prochain battement.
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (status === 'active') {
        dispatch({ type: 'TICK', now: Date.now() });
        return;
      }
      stopBeepPattern();
      stopAllClips();
      noTone();
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  const actions = useMemo<TimerActions>(
    () => ({
      power: () => dispatch({ type: 'POWER' }),
      selectField: () => dispatch({ type: 'FCN' }),
      increase: () => dispatch({ type: 'ADJUST', direction: 1 }),
      decrease: () => dispatch({ type: 'ADJUST', direction: -1 }),
      end: () => dispatch({ type: 'END' }),
      vortex: () => dispatch({ type: 'VORTEX' }),
    }),
    [],
  );

  return { state, actions };
}
