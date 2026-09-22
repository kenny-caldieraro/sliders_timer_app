import { memo } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useChrome, useRow } from '../hardware/display';
import { columnMaskOf, type Cell } from '../hardware/layout';
import { COLORS } from '../theme';

/**
 * Bargraphe vertical de huit segments.
 *
 * Les segments sont encastrés dans une gouttière sombre, comme sur l'objet :
 * le canal reste visible même éteint, et c'est lui qui donne l'échelle.
 *
 * Les colonnes suivent la convention de `LedControl` : la colonne 0 est le
 * bit de poids fort, et se trouve en haut.
 */

export type BarGraphProps = {
  cell: Cell;
  width: number;
  ledHeight: number;
  gap?: number;
};

function BarGraphView({ cell, width, ledHeight, gap = 4 }: BarGraphProps) {
  const value = useRow(cell.matrix, cell.row);
  const chrome = useChrome();
  const dimmed = chrome.off[cell.matrix];

  const padding = 4;
  const pitch = ledHeight + gap;
  const innerHeight = pitch * 8 - gap;
  const height = innerHeight + padding * 2;
  const totalWidth = width + padding * 2;
  const gradientId = `bar-${cell.matrix}-${cell.row}`;

  return (
    <Svg width={totalWidth} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={COLORS.barChannelEdge} />
          <Stop offset="0.35" stopColor={COLORS.barChannel} />
          <Stop offset="1" stopColor="#101010" />
        </LinearGradient>
      </Defs>

      {/* Gouttière */}
      <Rect
        x={0}
        y={0}
        width={totalWidth}
        height={height}
        rx={5}
        ry={5}
        fill={`url(#${gradientId})`}
      />

      {/*
        Halo : un segment allumé diffuse dans le diffuseur, il ne s'arrête pas
        net au bord. Deux passes translucides plus larges que le segment
        suffisent à le rendre, sans le coût d'un filtre.
      */}
      {Array.from({ length: 8 }, (_, index) => {
        const on = !dimmed && (value & columnMaskOf(index)) !== 0;
        if (!on) {
          return null;
        }
        const y = padding + index * pitch;
        return (
          <Rect
            key={`glow-${index}`}
            x={0}
            y={y - padding * 0.8}
            width={totalWidth}
            height={ledHeight + padding * 1.6}
            rx={4}
            ry={4}
            fill={COLORS.bar}
            fillOpacity={0.3}
          />
        );
      })}

      {Array.from({ length: 8 }, (_, index) => {
        const on = !dimmed && (value & columnMaskOf(index)) !== 0;
        const y = padding + index * pitch;
        if (!on) {
          return null;
        }
        return (
          <Rect
            key={index}
            x={padding}
            y={y}
            width={width}
            height={ledHeight}
            rx={2.5}
            ry={2.5}
            fill={COLORS.bar}
          />
        );
      })}
    </Svg>
  );
}

export const BarGraph = memo(BarGraphView);
