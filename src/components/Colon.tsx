import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLed } from '../hardware/display';
import { COLON_ROW } from '../hardware/layout';
import { COLORS } from '../theme';

/** Un séparateur : deux points pilotés chacun par leur propre LED. */

export type ColonProps = {
  /** Colonnes des deux points sur la ligne des séparateurs. */
  columns: readonly [number, number];
  /** Diamètre d'un point. */
  size: number;
  /** Écartement des deux points, calé sur la hauteur des chiffres. */
  spread: number;
};

function ColonView({ columns, size, spread }: ColonProps) {
  const top = useLed(COLON_ROW.matrix, COLON_ROW.row, columns[0]);
  const bottom = useLed(COLON_ROW.matrix, COLON_ROW.row, columns[1]);

  return (
    <View style={[styles.container, { height: spread, marginHorizontal: size * 0.35 }]}>
      {[top, bottom].map((on, index) => (
        <View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: on ? COLORS.led : COLORS.ledOff,
            // Le halo est indispensable : sans lui les points se perdent dans
            // le rétroéclairage de la bande.
            shadowColor: COLORS.led,
            shadowOpacity: on ? 0.95 : 0,
            shadowRadius: size * 0.9,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'space-between', alignItems: 'center' },
});

export const Colon = memo(ColonView);
