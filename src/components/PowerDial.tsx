import { memo, useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { NEOPIXEL_COUNT } from '../hardware/layout';
import { setKnob, toOpacity, useStrip } from '../hardware/strip';
import { COLORS } from '../theme';

/**
 * Potentiomètre d'alimentation et son arc lumineux.
 *
 * Sur la réplique, l'arc est un guide de lumière continu, pas une rangée de
 * points : les sept NeoPixel éclairent une même pièce translucide. C'est donc
 * un tracé progressif, et non des pastilles séparées.
 *
 * Le geste est capté par le cadre extérieur, qui ne tourne pas. L'écouter sur
 * le bouton lui-même faisait tourner le repère tactile avec lui, et la
 * rotation s'emballait.
 */

/** Amplitude de l'arc, en degrés, ouverture vers le bas. */
const ARC_SPAN = 270;
const ARC_START = -135;

/** Angle mesuré depuis midi, sens horaire. */
const polar = (center: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
};

const arcPath = (center: number, radius: number, from: number, to: number) => {
  const start = polar(center, radius, from);
  const end = polar(center, radius, to);
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

export type PowerDialProps = {
  size: number;
};

function PowerDialView({ size }: PowerDialProps) {
  const { knob, level, brightness } = useStrip();

  const center = size / 2;
  const stroke = Math.max(size * 0.055, 6);
  const radius = center - stroke;
  const knobSize = size * 0.6;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event) => {
          const dx = event.nativeEvent.locationX - center;
          const dy = event.nativeEvent.locationY - center;
          if (dx === 0 && dy === 0) {
            return;
          }
          // `atan2(dx, -dy)` donne l'angle depuis midi, positif dans le sens
          // horaire — l'orientation de l'arc.
          const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
          const ratio = (angle - ARC_START) / ARC_SPAN;
          // Le doigt qui passe dans l'ouverture basse se range au plus proche
          // des deux extrémités plutôt que de faire sauter la valeur.
          setKnob(Math.round(Math.min(Math.max(ratio, 0), 1) * NEOPIXEL_COUNT));
        },
      }),
    [center],
  );

  const track = arcPath(center, radius, ARC_START, ARC_START + ARC_SPAN);
  const filledSpan = (ARC_SPAN * level) / NEOPIXEL_COUNT;
  // Le bouton ne suit que la main de l'utilisateur : pendant une animation,
  // seule la lumière bouge.
  const knobAngle = ARC_START + (ARC_SPAN * knob) / NEOPIXEL_COUNT;
  const fill = filledSpan > 0 ? arcPath(center, radius, ARC_START, ARC_START + filledSpan) : null;
  const glow = toOpacity(brightness);

  return (
    <View style={[styles.container, { width: size, height: size }]} {...panResponder.panHandlers}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Path
          d={track}
          stroke={COLORS.stripOff}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
        {fill !== null && (
          <>
            {/* Halo : un tracé large et translucide sous le trait net. */}
            <Path
              d={fill}
              stroke={COLORS.strip}
              strokeWidth={stroke * 2.4}
              strokeOpacity={glow * 0.3}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={fill}
              stroke={COLORS.strip}
              strokeWidth={stroke}
              strokeOpacity={glow}
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: [{ rotate: `${knobAngle}deg` }],
          },
        ]}>
        <View style={[styles.slot, { height: Math.max(knobSize * 0.05, 3) }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  knob: {
    backgroundColor: COLORS.knob,
    borderWidth: 6,
    borderColor: COLORS.knobRing,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slot: {
    width: '78%',
    backgroundColor: COLORS.knobRing,
    borderRadius: 3,
  },
});

export const PowerDial = memo(PowerDialView);
