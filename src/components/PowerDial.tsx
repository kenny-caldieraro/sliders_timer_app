import { memo, useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { NEOPIXEL_COUNT } from '../hardware/layout';
import { setLevel, useStrip } from '../hardware/strip';
import { COLORS } from '../theme';

/**
 * Potentiomètre d'alimentation et son arc de sept LED.
 *
 * L'original mesurait le bouton à chaque mouvement du doigt via un
 * `measure()` asynchrone, ce qui donnait une rotation qui décroche. Ici on
 * lit les coordonnées du toucher relatives au bouton lui-même : le centre est
 * connu d'avance, il n'y a plus rien à mesurer.
 */

/** Amplitude de l'arc, en degrés. */
const ARC_SPAN = 270;
const ARC_START = -135;

export type PowerDialProps = {
  size: number;
  ledSize?: number;
};

function PowerDialView({ size, ledSize = 14 }: PowerDialProps) {
  const { level, brightness } = useStrip();
  const knobSize = size * 0.62;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event) => {
          // `locationX/Y` sont relatifs au bouton : son centre est à la moitié
          // de sa taille, sans mesure asynchrone.
          const half = knobSize / 2;
          const dx = event.nativeEvent.locationX - half;
          const dy = event.nativeEvent.locationY - half;
          if (dx === 0 && dy === 0) {
            return;
          }
          // Angle ramené sur l'arc utile, puis converti en nombre de LED.
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          if (angle > 180) {
            angle -= 360;
          }
          const ratio = (angle - ARC_START) / ARC_SPAN;
          setLevel(Math.round(ratio * NEOPIXEL_COUNT));
        },
      }),
    [knobSize],
  );

  const radius = size / 2 - ledSize / 2;
  const opacity = Math.max(brightness, 0) / 255;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {Array.from({ length: NEOPIXEL_COUNT }, (_, index) => {
        const angle = ARC_START + (ARC_SPAN * index) / (NEOPIXEL_COUNT - 1);
        const radians = ((angle - 90) * Math.PI) / 180;
        const on = index < level;
        return (
          <View
            key={index}
            pointerEvents="none"
            style={[
              styles.led,
              {
                width: ledSize,
                height: ledSize,
                borderRadius: ledSize / 2,
                backgroundColor: COLORS.strip,
                opacity: on ? Math.max(opacity, 0.15) : 0.08,
                transform: [
                  { translateX: radius * Math.cos(radians) },
                  { translateY: radius * Math.sin(radians) },
                ],
              },
            ]}
          />
        );
      })}

      <View
        {...panResponder.panHandlers}
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: [{ rotate: `${ARC_START + (ARC_SPAN * level) / NEOPIXEL_COUNT}deg` }],
          },
        ]}>
        <View style={[styles.marker, { height: knobSize * 0.06 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  led: { position: 'absolute' },
  knob: {
    backgroundColor: COLORS.knob,
    borderWidth: 8,
    borderColor: COLORS.knobRing,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: '100%',
    backgroundColor: COLORS.knobRing,
    position: 'absolute',
    borderRadius: 2,
  },
});

export const PowerDial = memo(PowerDialView);
