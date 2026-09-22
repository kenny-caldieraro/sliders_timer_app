import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useLed } from '../hardware/display';
import { STATUS_ROW } from '../hardware/layout';
import { COLORS, STATUS_COLORS } from '../theme';

/** Un témoin latéral rectangulaire et sa sérigraphie (TAU, DELTA, ZETA). */

export type StatusLedProps = {
  label: string;
  column: number;
  color: keyof typeof STATUS_COLORS;
  width: number;
};

function StatusLedView({ label, column, color, width }: StatusLedProps) {
  const on = useLed(STATUS_ROW.matrix, STATUS_ROW.row, column);
  const palette = STATUS_COLORS[color];

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.led,
          {
            width,
            height: width / 2.4,
            backgroundColor: on ? palette.on : palette.off,
            shadowColor: palette.on,
            shadowOpacity: on ? 0.9 : 0,
          },
        ]}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  led: {
    borderRadius: 3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export const StatusLed = memo(StatusLedView);
