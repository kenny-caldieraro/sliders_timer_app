import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { COLORS } from '../theme';
import type { Phase } from '../timer/types';

/**
 * Vortex d'arrière-plan.
 *
 * Le tunnel est fait d'anneaux concentriques en pointillés, tournant à des
 * vitesses et dans des sens différents : c'est le décalage entre eux qui donne
 * l'impression de profondeur, sans avoir à dessiner une spirale.
 *
 * Les rotations passent par le pilote natif : elles tournent sur le fil
 * d'affichage et ne coûtent rien à JavaScript, même pendant un décompte.
 */

type Ring = {
  /** Rayon relatif, de 0 à 1. */
  radius: number;
  /** Épaisseur du trait, relative au rayon extérieur. */
  width: number;
  /** Tour complet, en millisecondes, à intensité maximale. */
  duration: number;
  /** Sens de rotation. */
  reverse: boolean;
  /** Longueur des tirets et des trous. */
  dash: readonly [number, number];
  opacity: number;
};

const RINGS: readonly Ring[] = [
  { radius: 1.0, width: 0.03, duration: 42000, reverse: false, dash: [26, 20], opacity: 0.5 },
  { radius: 0.82, width: 0.035, duration: 31000, reverse: true, dash: [34, 16], opacity: 0.62 },
  { radius: 0.64, width: 0.04, duration: 23000, reverse: false, dash: [20, 26], opacity: 0.72 },
  { radius: 0.47, width: 0.045, duration: 16000, reverse: true, dash: [30, 14], opacity: 0.82 },
  { radius: 0.32, width: 0.05, duration: 11000, reverse: false, dash: [16, 18], opacity: 0.9 },
  { radius: 0.19, width: 0.055, duration: 7000, reverse: true, dash: [12, 10], opacity: 1 },
];

/**
 * Vivacité du vortex selon l'état du minuteur.
 * `speed` multiplie la vitesse de rotation, `opacity` l'intensité générale.
 */
function moodFor(phase: Phase): { speed: number; opacity: number } {
  switch (phase) {
    case 'off':
      return { speed: 0.25, opacity: 0.1 };
    case 'boot':
      return { speed: 1.4, opacity: 0.5 };
    case 'running':
      return { speed: 1.6, opacity: 0.55 };
    case 'burnout':
      return { speed: 2.6, opacity: 0.75 };
    case 'slide':
      return { speed: 5, opacity: 1 };
    case 'dead':
      return { speed: 0.15, opacity: 0.18 };
    default:
      return { speed: 1, opacity: 0.34 };
  }
}

export type VortexProps = {
  size: number;
  phase: Phase;
};

function VortexView({ size, phase }: VortexProps) {
  const mood = moodFor(phase);
  // Initialisation paresseuse plutôt qu'une référence : c'est la forme dont
  // React garantit la stabilité pour des valeurs animées.
  const [spins] = useState(() => RINGS.map(() => new Animated.Value(0)));
  const [glow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animations = spins.map((value, index) => {
      const ring = RINGS[index]!;
      value.setValue(0);
      return Animated.loop(
        Animated.timing(value, {
          toValue: 1,
          duration: Math.max(ring.duration / mood.speed, 900),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
    });

    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 2600 / mood.speed,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 2600 / mood.speed,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animations.forEach((animation) => animation.start());
    breathing.start();

    return () => {
      animations.forEach((animation) => animation.stop());
      breathing.stop();
    };
  }, [mood.speed, spins, glow]);

  const center = size / 2;
  const outer = center * 0.92;

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      {/* Cœur lumineux */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) },
        ]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="core" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={COLORS.vortexCore} stopOpacity={0.55 * mood.opacity} />
              <Stop offset="0.35" stopColor={COLORS.vortexGlow} stopOpacity={0.3 * mood.opacity} />
              <Stop offset="1" stopColor={COLORS.vortexGlow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={center} cy={center} r={center} fill="url(#core)" />
        </Svg>
      </Animated.View>

      {RINGS.map((ring, index) => {
        const radius = outer * ring.radius;
        const strokeWidth = Math.max(outer * ring.width, 1);
        const spin = spins[index]!;
        return (
          <Animated.View
            key={ring.radius}
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  {
                    rotate: spin.interpolate({
                      inputRange: [0, 1],
                      outputRange: ring.reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}>
            <Svg width={size} height={size}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={index >= 4 ? COLORS.vortexCore : COLORS.vortexGlow}
                strokeWidth={strokeWidth}
                strokeOpacity={ring.opacity * mood.opacity}
                strokeDasharray={`${ring.dash[0]} ${ring.dash[1]}`}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});

export const Vortex = memo(VortexView);
