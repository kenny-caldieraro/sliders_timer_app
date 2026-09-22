import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useRow } from '../hardware/display';
import { EMITTER_ROW, columnMaskOf } from '../hardware/layout';
import { COLORS } from '../theme';

/**
 * Zone d'émetteur, sur le chant supérieur du minuteur.
 *
 * Quatre sources derrière un même guide de lumière : les deux du milieu sont
 * blanches et signalent l'armement puis le compte à rebours final ; les deux
 * extérieures sont rouges et ne s'allument qu'à l'ouverture du vortex.
 *
 * Le firmware les pilote via `lc.setLed(1, 7, 1..4, …)`.
 */

/** Ordre des quatre sources, de gauche à droite. */
const LAMPS = [
  { column: 1, color: COLORS.vortexRed },
  { column: 2, color: COLORS.vortexWhite },
  { column: 3, color: COLORS.vortexWhite },
  { column: 4, color: COLORS.vortexRed },
] as const;

const HEIGHT = 22;
const RADIUS = 5;

export type EmitterProps = {
  width: number;
};

function EmitterView({ width }: EmitterProps) {
  const row = useRow(EMITTER_ROW.matrix, EMITTER_ROW.row);

  const slotWidth = width / LAMPS.length;

  return (
    <View style={[styles.container, { width, height: HEIGHT }]}>
      <Svg width={width} height={HEIGHT}>
        <Defs>
          <LinearGradient id="emitterBody" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1b1b1b" />
            <Stop offset="1" stopColor="#0a0a0a" />
          </LinearGradient>
        </Defs>

        {/* Le guide de lumière lui-même, éteint. */}
        <Rect
          x={0}
          y={0}
          width={width}
          height={HEIGHT}
          rx={RADIUS}
          ry={RADIUS}
          fill="url(#emitterBody)"
        />

        {LAMPS.map(({ column, color }, index) => {
          const on = (row & columnMaskOf(column)) !== 0;
          if (!on) {
            return null;
          }
          const x = index * slotWidth;
          return (
            <Rect
              key={column}
              x={x + 2}
              y={2}
              width={slotWidth - 4}
              height={HEIGHT - 4}
              rx={RADIUS - 2}
              ry={RADIUS - 2}
              fill={color}
              // Les sources diffusent dans le guide : un bord franc ferait
              // pastille, pas lampe.
              fillOpacity={0.92}
            />
          );
        })}

        {/* Reflet du plastique, par-dessus. */}
        <Rect
          x={3}
          y={2}
          width={width - 6}
          height={HEIGHT / 3}
          rx={RADIUS - 3}
          ry={RADIUS - 3}
          fill="#ffffff"
          fillOpacity={0.06}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
});

export const Emitter = memo(EmitterView);
