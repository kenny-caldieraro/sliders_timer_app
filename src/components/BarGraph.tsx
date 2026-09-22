import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useChrome, useRow } from '../hardware/display';
import type { Cell } from '../hardware/layout';
import { COLORS } from '../theme';

/**
 * Bargraphe vertical de huit LED, câblé sur une ligne de matrice.
 * Un bit par LED : le bit 7 en haut, le bit 0 en bas.
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

  return (
    <View style={styles.container}>
      {Array.from({ length: 8 }, (_, index) => {
        const bit = 7 - index;
        const on = !dimmed && (value & (1 << bit)) !== 0;
        return (
          <View
            key={bit}
            style={[
              styles.led,
              {
                width,
                height: ledHeight,
                marginVertical: gap / 2,
                backgroundColor: on ? COLORS.bar : COLORS.barOff,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  led: { borderRadius: 2 },
});

export const BarGraph = memo(BarGraphView);
