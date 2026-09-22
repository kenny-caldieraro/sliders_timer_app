import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLed } from '../hardware/display';
import { COLON_ROW } from '../hardware/layout';
import { COLORS } from '../theme';

/** Un séparateur : deux points pilotés chacun par leur propre LED. */

export type ColonProps = {
  /** Colonnes des deux points sur la ligne des séparateurs. */
  columns: readonly [number, number];
  size: number;
};

function ColonView({ columns, size }: ColonProps) {
  const top = useLed(COLON_ROW.matrix, COLON_ROW.row, columns[0]);
  const bottom = useLed(COLON_ROW.matrix, COLON_ROW.row, columns[1]);

  return (
    <View style={styles.container}>
      {[top, bottom].map((on, index) => (
        <View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: on ? COLORS.led : COLORS.ledOff,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', alignItems: 'center', height: 52 },
});

export const Colon = memo(ColonView);
