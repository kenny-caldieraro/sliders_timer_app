import { memo } from 'react';

import { MAX_INTENSITY, useChrome, useRow } from '../hardware/display';
import type { Cell } from '../hardware/layout';
import { SevenSegment } from './SevenSegment';
import { COLORS } from '../theme';

/**
 * Un afficheur câblé sur une ligne de matrice.
 *
 * Il ne s'abonne qu'à sa propre ligne : écrire les secondes ne re-rend pas
 * les heures.
 */

export type DigitProps = {
  cell: Cell;
  height: number;
  onColor?: string;
  offColor?: string;
};

function DigitView({ cell, height, onColor = COLORS.led, offColor = COLORS.ledOff }: DigitProps) {
  const value = useRow(cell.matrix, cell.row);
  const chrome = useChrome();
  const off = chrome.off[cell.matrix];
  const intensity = off ? 0 : (chrome.intensity[cell.matrix] ?? MAX_INTENSITY) / MAX_INTENSITY;

  return (
    <SevenSegment
      value={off ? 0 : value}
      height={height}
      onColor={onColor}
      offColor={offColor}
      intensity={intensity}
    />
  );
}

export const Digit = memo(DigitView);
