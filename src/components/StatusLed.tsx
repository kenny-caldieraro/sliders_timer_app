import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useLed } from '../hardware/display';
import { STATUS_ROW } from '../hardware/layout';
import { COLORS, STATUS_COLORS } from '../theme';

/**
 * Un témoin latéral rectangulaire et sa sérigraphie (TAU, DELTA, ZETA).
 *
 * Il reprend les dimensions d'un segment de bargraphe : sur la façade, ce
 * sont les mêmes LED derrière le même diffuseur, seule la couleur change.
 */

export type StatusLedProps = {
  label: string;
  column: number;
  color: keyof typeof STATUS_COLORS;
  width: number;
  height: number;
};

function StatusLedView({ label, column, color, width, height }: StatusLedProps) {
  const on = useLed(STATUS_ROW.matrix, STATUS_ROW.row, column);
  const palette = STATUS_COLORS[color];

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.led,
          {
            width,
            height,
            backgroundColor: on ? palette.on : palette.off,
          },
        ]}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  led: { borderRadius: 2.5 },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});

export const StatusLed = memo(StatusLedView);
