import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

import type { TimerAction, TimerState } from '../timer/types';

/**
 * Mémorise le dernier temps réglé.
 *
 * Le firmware fait la même chose en EEPROM (`EEPROM_TOTALSECTIME_SLIDE_ADDR`) :
 * on retrouve son réglage au rallumage plutôt que de tout ressaisir.
 */

const KEY = 'sliders-timer/last-duration';

export function usePersistedTime(
  state: TimerState,
  dispatch: (action: TimerAction) => void,
) {
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((value) => {
        const ms = Number(value);
        if (Number.isFinite(ms) && ms > 0) {
          dispatch({ type: 'HYDRATE', remainingMs: ms });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        hydrated.current = true;
      });
  }, [dispatch]);

  useEffect(() => {
    // On n'enregistre qu'un réglage validé, jamais un décompte en cours.
    if (!hydrated.current || state.phase !== 'idle' || state.remainingMs <= 0) {
      return;
    }
    AsyncStorage.setItem(KEY, String(state.remainingMs)).catch(() => undefined);
  }, [state.phase, state.remainingMs]);
}
