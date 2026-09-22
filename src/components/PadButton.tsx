import * as Haptics from 'expo-haptics';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '../theme';

/**
 * Touche de la façade.
 *
 * Le contour est un biseau : clair en haut où il capte la lumière, sombre en
 * bas. C'est ce dégradé sur le seul contour qui fait la touche moulée — un
 * trait d'une couleur unie donne un bouton dessiné.
 */

export type PadButtonProps = {
  label: string;
  onPress: () => void;
  /** Les deux grosses touches « 1 » et « 4 » du pavé. */
  large?: boolean;
  /** Lettres du clavier téléphonique, en petit au-dessus du chiffre. */
  letters?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
};

const SIZES = {
  large: { width: 96, height: 48, radius: 20, font: 23 },
  small: { width: 80, height: 46, radius: 19, font: 12.5 },
} as const;

function PadButtonView({
  label,
  onPress,
  large = false,
  letters,
  accessibilityLabel,
  disabled = false,
}: PadButtonProps) {
  const [pressed, setPressed] = useState(false);
  const size = large ? SIZES.large : SIZES.small;
  const id = `key-${large ? 'l' : 's'}-${label.replace(/\W/g, '')}`;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(
      large ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => undefined);
    onPress();
  }, [large, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      // Zone tactile confortable même si la touche est petite.
      hitSlop={8}
      style={[{ width: size.width, height: size.height }, disabled && styles.disabled]}>
      <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0" stopColor={COLORS.keyEdgeLight} />
            <Stop offset="0.55" stopColor="#6d6d6d" />
            <Stop offset="1" stopColor={COLORS.keyEdgeDark} />
          </LinearGradient>
        </Defs>
        <Rect
          x={1.2}
          y={1.2}
          width={size.width - 2.4}
          height={size.height - 2.4}
          rx={size.radius}
          ry={size.radius}
          fill={pressed ? COLORS.keyFacePressed : COLORS.keyFace}
          stroke={`url(#${id})`}
          strokeWidth={2.4}
        />
      </Svg>

      <View style={styles.content}>
        {letters !== undefined && <Text style={styles.letters}>{letters}</Text>}
        <Text style={[styles.label, { fontSize: size.font }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  letters: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: { opacity: 0.35 },
});

export const PadButton = memo(PadButtonView);
