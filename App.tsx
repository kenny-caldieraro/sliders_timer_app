import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BarGraph } from './src/components/BarGraph';
import { Colon } from './src/components/Colon';
import { Digit } from './src/components/Digit';
import { Emitter } from './src/components/Emitter';
import { HelpSheet } from './src/components/HelpSheet';
import { PadButton } from './src/components/PadButton';
import { PowerDial } from './src/components/PowerDial';
import { StatusLed } from './src/components/StatusLed';
import { Vortex } from './src/components/Vortex';
import { Window } from './src/components/Window';
import {
  BARGRAPH_LEFT,
  BARGRAPH_RIGHT,
  DAY_DIGITS,
  HOURS,
  MINUTES,
  SECONDS,
  STATUS_LEDS,
} from './src/hardware/layout';
import { COLORS } from './src/theme';
import { formatSpoken } from './src/timer/format';
import { useTimer } from './src/timer/useTimer';

/**
 * Façade du minuteur.
 *
 * Ce composant ne se re-rend que lorsque la phase change. Les afficheurs, les
 * témoins et les bargraphes sont abonnés individuellement aux lignes des
 * matrices, donc une animation à soixante images par seconde ne le traverse
 * jamais.
 */
export default function App() {
  const { width, height } = useWindowDimensions();
  const { state, actions } = useTimer();
  const [helpVisible, setHelpVisible] = useState(false);

  const openHelp = useCallback(() => setHelpVisible(true), []);
  const closeHelp = useCallback(() => setHelpVisible(false), []);

  // Toutes les tailles dérivent de la largeur : l'interface tient aussi bien
  // sur un petit écran que sur une tablette, sans hauteur codée en dur.
  // Budget vertical : le panneau doit tenir au-dessus du pavé sans le
  // recouvrir. Chaque taille est plafonnée par la hauteur disponible, pas
  // seulement par la largeur.
  const timeDigit = Math.min(width * 0.17, height * 0.088);
  const dayDigit = timeDigit * 0.48;
  const dialSize = Math.min(width * 0.37, height * 0.15);
  const vortexSize = Math.min(width * 0.33, height * 0.125);

  const isOn = state.phase !== 'off';
  const label = isOn ? formatSpoken(state.remainingMs) : 'Minuteur éteint';

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* Corps de l'objet : plastique moulé, plus clair en haut. */}
        <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
          <Defs>
            <LinearGradient id="chassis" x1="0" y1="0" x2="0.35" y2="1">
              <Stop offset="0" stopColor={COLORS.chassisTop} />
              <Stop offset="0.55" stopColor={COLORS.chassisBottom} />
              <Stop offset="1" stopColor={COLORS.background} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={height} fill="url(#chassis)" />
        </Svg>

        {/*
          Grain du plastique, relevé sur une photo de la réplique. Posé en
          surimpression légère : il donne la matière sans toucher à la couleur.
        */}
        <Image
          source={require('./assets/texture-chassis.png')}
          style={styles.texture}
          resizeMode="cover"
          accessible={false}
        />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <StatusBar hidden />

          <View style={styles.topBar}>
            <Pressable
              onPress={openHelp}
              accessibilityRole="button"
              accessibilityLabel="Afficher la notice"
              hitSlop={12}
              style={({ pressed }) => [styles.helpButton, pressed && styles.helpPressed]}>
              <Text style={styles.helpGlyph}>?</Text>
            </Pressable>
          </View>

          <View
            style={styles.stack}
            accessible
            accessibilityRole="timer"
            accessibilityLabel={label}>
            <View style={styles.panel}>
              {/* Vortex, sur le devant, juste au-dessus des LED de l'émetteur */}
              <Vortex size={vortexSize} phase={state.phase} />

              {/* Émetteur : deux LED blanches au centre, deux rouges aux bouts */}
              <Emitter width={Math.min(width * 0.5, 230)} />

              {/* Jours */}
              <Window inset={18}>
                <Text style={styles.caption}>DAYS</Text>
                <View style={styles.row}>
                  {DAY_DIGITS.map((cell) => (
                    <Digit key={`${cell.matrix}-${cell.row}`} cell={cell} height={dayDigit} />
                  ))}
                </View>
              </Window>

              {/* Potentiomètre */}
              <PowerDial size={dialSize} />

              {/* Heures, minutes, secondes */}
              <Window inset={12}>
                <View style={styles.timeRow}>
                  <TimeGroup caption="HRS" cells={[HOURS.tens, HOURS.units]} height={timeDigit} />
                  <Colon columns={[1, 2]} size={timeDigit * 0.12} />
                  <TimeGroup
                    caption="MINS"
                    cells={[MINUTES.tens, MINUTES.units]}
                    height={timeDigit}
                  />
                  <Colon columns={[3, 4]} size={timeDigit * 0.12} />
                  <TimeGroup
                    caption="SECS"
                    cells={[SECONDS.tens, SECONDS.units]}
                    height={timeDigit}
                  />
                </View>
              </Window>

              {/* Témoins et bargraphes */}
              <Window inset={16} style={styles.middleWindow}>
                <View style={styles.middle}>
                  <View style={styles.statusColumn}>
                    {STATUS_LEDS.map((led) => (
                      <StatusLed
                        key={led.label}
                        label={led.label}
                        column={led.column}
                        color={led.color}
                        width={26}
                      />
                    ))}
                  </View>
                  <View style={styles.bargraphs}>
                    <BarGraph cell={BARGRAPH_LEFT} width={32} ledHeight={9} />
                    <View style={styles.ladder}>
                      {Array.from({ length: 6 }, (_, index) => (
                        <Text key={index} style={styles.ladderRung}>
                          --
                        </Text>
                      ))}
                    </View>
                    <BarGraph cell={BARGRAPH_RIGHT} width={32} ledHeight={9} />
                  </View>
                </View>
              </Window>
            </View>

            {/* Pavé */}
            <View style={styles.pad}>
              <View style={styles.padColumn}>
                <PadButton
                  label="1"
                  large
                  onPress={actions.increase}
                  accessibilityLabel="Augmenter"
                />
                <PadButton
                  label="4"
                  large
                  onPress={actions.decrease}
                  accessibilityLabel="Diminuer"
                />
              </View>
              <View style={styles.padRow}>
                <PadButton
                  label="PWR"
                  onPress={actions.power}
                  accessibilityLabel="Allumer ou éteindre"
                />
                <PadButton
                  label="FCN"
                  onPress={actions.selectField}
                  accessibilityLabel="Choisir le champ à régler"
                />
                {/* La façade du prop porte « NAME / MENU ». Sur la réplique
                    matérielle, le burnout a son propre bouton ; ici il prend la
                    place de cette touche, qui ne servait à rien. */}
                <PadButton
                  label={'NAME\nMENU'}
                  onPress={actions.vortex}
                  accessibilityLabel="Forcer le saut et passer en burnout"
                />
                <PadButton
                  label="END"
                  onPress={actions.end}
                  accessibilityLabel="Lancer le saut"
                />
              </View>
            </View>
          </View>
        </SafeAreaView>

        <HelpSheet visible={helpVisible} onClose={closeHelp} />
      </View>
    </SafeAreaProvider>
  );
}

type TimeGroupProps = {
  caption: string;
  cells: readonly { matrix: 0 | 1; row: number }[];
  height: number;
};

function TimeGroup({ caption, cells, height }: TimeGroupProps) {
  return (
    <View style={styles.block}>
      <Text style={styles.caption}>{caption}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <Digit key={`${cell.matrix}-${cell.row}`} cell={cell} height={height} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  // L'image ne doit jamais intercepter un appui : `pointerEvents` passe
  // par le style, `Image` ne l'accepte pas en propriété.
  texture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.17,
    pointerEvents: 'none',
  },
  topBar: { paddingHorizontal: 18, paddingTop: 4, alignItems: 'flex-start' },
  helpButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'rgba(242, 242, 242, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  helpPressed: { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
  helpGlyph: { color: COLORS.text, fontSize: 17, fontWeight: '800', lineHeight: 20 },
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  // Le bloc d'affichage occupe tout l'espace au-dessus du pavé et répartit
  // ses rangées à l'intérieur : le pavé reste sous le pouce, sans laisser de
  // vide au milieu sur les écrans très hauts.
  panel: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 8,
  },
  block: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  caption: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  middleWindow: { width: '100%' },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusColumn: { justifyContent: 'space-between', gap: 10 },
  bargraphs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ladder: { alignItems: 'center' },
  ladderRung: { color: 'rgba(242, 242, 242, 0.55)', letterSpacing: -2, fontSize: 11, lineHeight: 13 },
  pad: { width: '100%', gap: 12 },
  padColumn: { alignItems: 'flex-start', gap: 10 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});
