/*
 * `react-hooks/immutability` signale les appels à `player` depuis un effet.
 * C'est ici l'usage prévu par expo-video : le lecteur est un objet natif
 * partagé qu'on pilote par ses méthodes, et il n'entre jamais dans le rendu.
 */
/* eslint-disable react-hooks/immutability */
import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { VideoView, useVideoPlayer } from 'expo-video';

import type { Phase } from '../timer/types';

/**
 * Bandeau du vortex, en haut de l'écran.
 *
 * C'est la bande qui coiffait déjà la façade dans la version d'origine, au
 * ras du bord haut. La vidéo la remplit en `cover` : elle déborde et se
 * recadre plutôt que de laisser des bandes noires, on n'a pas besoin de voir
 * l'image entière.
 *
 * Le bandeau ne s'allume qu'au moment du saut. Le reste du temps il est
 * éteint : un vortex qui tourne en permanence n'aurait plus rien d'un
 * événement, et ferait tourner un décodeur vidéo pour rien.
 *
 * Le bandeau est posé en absolu, hors du flux : il ne prend aucune place aux
 * afficheurs.
 *
 * ATTENTION — `assets/vortex.mp4` est un extrait de la série. Ces images ne
 * sont pas libres de droits : les embarquer dans une application publiée
 * expose à un retrait pour propriété intellectuelle. Pour une diffusion sur
 * les magasins, remplacer la source par un rendu original.
 */

/** Durée du fondu d'ouverture et de fermeture, en millisecondes. */
const FADE_MS = 420;

export type VortexPortalProps = {
  width: number;
  height: number;
  phase: Phase;
};

function VortexPortalView({ width, height, phase }: VortexPortalProps) {
  const player = useVideoPlayer(require('../../assets/vortex.mp4'), (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  const active = phase === 'slide';
  const [fade] = useState(() => new Animated.Value(0));

  useEffect(() => {
    try {
      if (active) {
        player.currentTime = 0;
        player.play();
      } else {
        player.pause();
      }
    } catch {
      // Le lecteur a été libéré : rien à piloter.
    }

    Animated.timing(fade, {
      toValue: active ? 1 : 0,
      duration: FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [active, player, fade]);

  return (
    <Animated.View style={[styles.band, { height, opacity: fade }]} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />

      {/* L'arête basse se fond dans le noir de la façade : sans ça, le bandeau
          se lit comme une vidéo collée sur l'objet. */}
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <LinearGradient id="bandFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0.35} />
            <Stop offset="0.45" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.82" stopColor="#000000" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#000000" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#bandFade)" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});

export const VortexPortal = memo(VortexPortalView);
