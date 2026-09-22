import { memo } from 'react';
import Svg, { Rect } from 'react-native-svg';

import { useChrome, useRow } from '../hardware/display';
import { columnMaskOf, type Cell } from '../hardware/layout';
import { COLORS } from '../theme';

/**
 * Bargraphe vertical de huit segments, câblé sur une ligne de matrice.
 *
 * Les colonnes suivent la convention de `LedControl` : la colonne 0 est le
 * bit de poids fort, et se trouve en haut du bargraphe.
 *
 * Chaque segment allumé est doublé d'un halo translucide : sur la réplique
 * ce sont des barres vertes derrière un diffuseur, pas des rectangles nets.
 */

export type BarGraphProps = {
  cell: Cell;
  width: number;
  ledHeight: number;
  gap?: number;
};

function BarGraphView({ cell, width, ledHeight, gap = 3 }: BarGraphProps) {
  const value = useRow(cell.matrix, cell.row);
  const chrome = useChrome();
  const dimmed = chrome.off[cell.matrix];

  const pitch = ledHeight + gap;
  const height = pitch * 8;
  const halo = Math.min(gap, 4);

  return (
    <Svg width={width + halo * 2} height={height}>
      {Array.from({ length: 8 }, (_, index) => {
        const on = !dimmed && (value & columnMaskOf(index)) !== 0;
        const y = index * pitch;
        return on ? (
          <Rect
            key={index}
            x={0}
            y={y}
            width={width + halo * 2}
            height={ledHeight + halo}
            rx={3}
            ry={3}
            fill={COLORS.bar}
            fillOpacity={0.28}
          />
        ) : null;
      })}
      {Array.from({ length: 8 }, (_, index) => {
        const on = !dimmed && (value & columnMaskOf(index)) !== 0;
        const y = index * pitch;
        return (
          <Rect
            key={index}
            x={halo}
            y={y + halo / 2}
            width={width}
            height={ledHeight}
            rx={2}
            ry={2}
            fill={on ? COLORS.bar : COLORS.barOff}
          />
        );
      })}
    </Svg>
  );
}

export const BarGraph = memo(BarGraphView);
