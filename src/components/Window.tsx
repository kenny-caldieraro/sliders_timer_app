import type { ReactNode } from 'react';
import { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { COLORS } from '../theme';

/**
 * Petite fenêtre d'afficheur, encastrée dans la façade.
 *
 * Sert au bloc des jours, qui n'a pas le rétroéclairage de la bande horaire :
 * c'est une simple découpe, légèrement plus claire que le noir du châssis.
 */

export type WindowProps = {
  children: ReactNode;
  style?: ViewStyle;
  inset?: number;
};

function WindowView({ children, style, inset = 12 }: WindowProps) {
  return <View style={[styles.frame, { paddingHorizontal: inset }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#0a0a0a',
    borderRadius: 6,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.barChannelEdge,
    alignItems: 'center',
  },
});

export const Window = memo(WindowView);
