import type { ReactNode } from 'react';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../theme';

/**
 * Bande rétroéclairée des afficheurs horaires.
 *
 * Sur l'objet, les six afficheurs sont derrière une même vitre teintée que le
 * rétroéclairage rouge traverse : la bande entière rougeoie, pas seulement les
 * segments. Deux liserés clairs marquent les arêtes de la découpe.
 */

export type DisplayBandProps = {
  children: ReactNode;
  width: number;
  height: number;
};

function DisplayBandView({ children, width, height }: DisplayBandProps) {
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="band" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.displayBackDark} />
            <Stop offset="0.45" stopColor={COLORS.displayBackLit} />
            <Stop offset="1" stopColor={COLORS.displayBackDark} />
          </LinearGradient>
          {/* Le liseré s'éteint sur les bords : la lumière vient du centre. */}
          <LinearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={COLORS.displayEdge} stopOpacity={0} />
            <Stop offset="0.5" stopColor={COLORS.displayEdge} stopOpacity={1} />
            <Stop offset="1" stopColor={COLORS.displayEdge} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#band)" />
        <Rect x={0} y={0} width={width} height={1.5} fill="url(#edge)" />
        <Rect x={0} y={height - 1.5} width={width} height={1.5} fill="url(#edge)" />
      </Svg>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export const DisplayBand = memo(DisplayBandView);
