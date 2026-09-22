import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../theme';

/** Un bouton de la façade. */

export type PadButtonProps = {
  label: string;
  onPress: () => void;
  /** Les deux grosses touches « 1 » et « 4 » du pavé. */
  large?: boolean;
  /** Libellé lu par les lecteurs d'écran, quand le sigle ne suffit pas. */
  accessibilityLabel?: string;
  disabled?: boolean;
};

function PadButtonView({
  label,
  onPress,
  large = false,
  accessibilityLabel,
  disabled = false,
}: PadButtonProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(
      large ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => undefined);
    onPress();
  }, [large, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      // Zone tactile confortable même si le bouton est petit.
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : styles.small,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.label, large ? styles.labelLarge : styles.labelSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.outline,
    borderWidth: 3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
  },
  large: { width: 84, height: 46, alignItems: 'flex-end', paddingRight: 12 },
  small: { width: 72, height: 42, alignItems: 'center' },
  pressed: { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
  disabled: { opacity: 0.35 },
  label: { color: COLORS.text, fontWeight: '700', textAlign: 'center' },
  labelLarge: { fontSize: 24 },
  labelSmall: { fontSize: 12, lineHeight: 14 },
});

export const PadButton = memo(PadButtonView);
