import type { ReactNode } from 'react';
import { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { COLORS } from '../theme';

/**
 * Fenêtre d'afficheur encastrée dans le châssis.
 *
 * Sur la réplique, les afficheurs sont au fond d'une découpe : l'arête haute
 * prend l'ombre, l'arête basse accroche la lumière. C'est ce relief qui
 * distingue une façade moulée d'un aplat noir.
 */

export type WindowProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Marge intérieure horizontale. */
  inset?: number;
};

function WindowView({ children, style, inset = 14 }: WindowProps) {
  return (
    <View style={[styles.frame, { paddingHorizontal: inset }, style]}>
      <View style={styles.sheen} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.window,
    borderRadius: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth * 3,
    borderTopColor: COLORS.bevelDark,
    borderBottomWidth: StyleSheet.hairlineWidth * 3,
    borderBottomColor: COLORS.bevelLight,
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Reflet du plexiglas, en haut de la découpe.
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 255, 255, 0.022)',
  },
});

export const Window = memo(WindowView);
