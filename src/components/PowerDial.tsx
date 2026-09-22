import { memo, useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { NEOPIXEL_COUNT } from '../hardware/layout';
import { setKnob, toOpacity, useStrip } from '../hardware/strip';
import { COLORS } from '../theme';

/**
 * Molette d'alimentation et son arc lumineux.
 *
 * La molette est une pièce tournée : une collerette biseautée, éclairée en
 * haut à gauche, et une face plus sombre creusée d'une fente. Tout est en
 * dégradés — un aplat gris ne donne pas le relief.
 *
 * L'arc est un guide de lumière continu, plus vif à son sommet, doublé de deux
 * passes translucides qui font le halo.
 *
 * Le geste est capté par le cadre extérieur, qui ne tourne pas : l'écouter sur
 * la molette elle-même faisait tourner le repère tactile avec elle.
 */

/** Amplitude de l'arc, en degrés, ouverture vers le bas. */
const ARC_SPAN = 250;
const ARC_START = -125;

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
  // L'arc court au bord, la molette occupe le reste.
  const arcStroke = size * 0.044;
  const arcRadius = center - arcStroke * 0.9;
  const ringRadius = size * 0.375;
  const faceRadius = ringRadius * 0.76;

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

  const track = arcPath(center, arcRadius, ARC_START, ARC_START + ARC_SPAN);
  const filledSpan = (ARC_SPAN * level) / NEOPIXEL_COUNT;
  const fill = filledSpan > 0 ? arcPath(center, arcRadius, ARC_START, ARC_START + filledSpan) : null;
  const glow = toOpacity(brightness);
  const knobAngle = ARC_START + (ARC_SPAN * knob) / NEOPIXEL_COUNT;

  const slotWidth = faceRadius * 1.62;
  const slotHeight = faceRadius * 0.15;

  return (
    <View style={[styles.container, { width: size, height: size }]} {...panResponder.panHandlers}>
      <Svg width={size} height={size}>
        <Defs>
          {/* L'arc est plus chaud à son sommet : la lumière y est frontale. */}
          <LinearGradient id="arc" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.stripHot} />
            <Stop offset="0.45" stopColor={COLORS.strip} />
            <Stop offset="1" stopColor="#8e0d0d" />
          </LinearGradient>
          {/* Collerette : éclairée en haut à gauche, dans l'ombre en bas. */}
          <LinearGradient id="ring" x1="0.15" y1="0" x2="0.85" y2="1">
            <Stop offset="0" stopColor={COLORS.knobRingLight} />
            <Stop offset="0.5" stopColor="#262626" />
            <Stop offset="1" stopColor={COLORS.knobRingDark} />
          </LinearGradient>
          {/* Face du bouton, creusée : plus sombre que la collerette. */}
          <LinearGradient id="face" x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor={COLORS.knobFaceLight} />
            <Stop offset="0.55" stopColor="#1d1d1d" />
            <Stop offset="1" stopColor={COLORS.knobFaceDark} />
          </LinearGradient>
          <LinearGradient id="slot" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.knobSlotEdge} />
            <Stop offset="0.35" stopColor={COLORS.knobSlot} />
            <Stop offset="1" stopColor="#0d0d0d" />
          </LinearGradient>
        </Defs>

        {/* Gouttière de l'arc, éteinte */}
        <Path
          d={track}
          stroke={COLORS.stripOff}
          strokeWidth={arcStroke}
          strokeLinecap="round"
          fill="none"
        />

        {fill !== null && (
          <>
            {/* Deux passes larges et translucides : c'est le halo. */}
            <Path
              d={fill}
              stroke={COLORS.strip}
              strokeWidth={arcStroke * 3.2}
              strokeOpacity={glow * 0.16}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={fill}
              stroke={COLORS.strip}
              strokeWidth={arcStroke * 1.9}
              strokeOpacity={glow * 0.3}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={fill}
              stroke="url(#arc)"
              strokeWidth={arcStroke}
              strokeOpacity={glow}
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Collerette */}
        <Circle cx={center} cy={center} r={ringRadius} fill="url(#ring)" />
        {/* Arête vive au sommet de la collerette */}
        <Circle
          cx={center}
          cy={center}
          r={ringRadius}
          stroke="rgba(255, 255, 255, 0.10)"
          strokeWidth={1}
          fill="none"
        />

        {/* Face, avec la fente qui suit la position de la molette */}
        <G rotation={knobAngle} origin={`${center}, ${center}`}>
          <Circle cx={center} cy={center} r={faceRadius} fill="url(#face)" />
          <Rect
            x={center - slotWidth / 2}
            y={center - slotHeight / 2}
            width={slotWidth}
            height={slotHeight}
            rx={slotHeight / 2}
            ry={slotHeight / 2}
            fill="url(#slot)"
            transform={`rotate(45, ${center}, ${center})`}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
});

export const PowerDial = memo(PowerDialView);
