import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BarGraph } from './src/components/BarGraph';
import { Colon } from './src/components/Colon';
import { Digit } from './src/components/Digit';
import { DisplayBand } from './src/components/DisplayBand';
import { Emitter } from './src/components/Emitter';
import { HelpSheet } from './src/components/HelpSheet';
import { PadButton } from './src/components/PadButton';
import { PowerDial } from './src/components/PowerDial';
import { StatusLed } from './src/components/StatusLed';
import { VortexPortal } from './src/components/VortexPortal';
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
 *
 * Les proportions suivent l'objet : une grosse molette, une bande horaire
 * pleine largeur, et le pavé en bas sous le pouce.
 */
export default function App() {
  const { width, height } = useWindowDimensions();
  const { state, actions } = useTimer();
  const [helpVisible, setHelpVisible] = useState(false);

  const openHelp = useCallback(() => setHelpVisible(true), []);
  const closeHelp = useCallback(() => setHelpVisible(false), []);

  // Toutes les tailles dérivent de la largeur, plafonnées par la hauteur :
  // l'interface tient aussi bien sur un petit écran que sur une tablette.
  // Budget vertical. Le panneau doit loger six rangées au-dessus du pavé :
  // chaque taille est donc plafonnée par la hauteur, pas seulement par la
  // largeur, sinon le bloc déborde sur un écran court.
  /*
   * Proportions relevées sur l'objet réel :
   *   - les six afficheurs horaires occupent la largeur presque bord à bord ;
   *   - les afficheurs de jours font environ 70 % de leur hauteur ;
   *   - la molette est petite, à peu près un tiers de la largeur ;
   *   - l'ensemble est dense, pas étalé sur la hauteur.
   *
   * La taille des chiffres se déduit donc du contenu — un afficheur est
   * 0,62 fois plus large que haut, six d'affilée plus deux séparateurs —
   * et non d'une fraction arbitraire de l'écran.
   */
  const DIGIT_RATIO = 0.622;
  const timeDigit = Math.min((width * 0.92) / (6 * DIGIT_RATIO + 0.34), height * 0.105);
  const dayDigit = timeDigit * 0.7;
  const dialSize = Math.min(width * 0.33, height * 0.148);
  const bandHeight = timeDigit * 1.2;
  // Le bandeau du vortex coiffe l'écran, hors du flux : il ne vole aucune
  // place aux afficheurs.
  const portalHeight = Math.max(height * 0.07, 54);

  // Hauteur des bargraphes, calculée ici pour que l'échelle gravée et la
  // rangée entière s'y accordent. Une hauteur en pourcentage créerait une
  // dépendance circulaire avec le parent, que yoga résout en gonflant le bloc.
  const barSegment = 8;
  const barGap = 4;
  const barHeight = 8 * (barSegment + barGap) - barGap + 8;

  const isOn = state.phase !== 'off';
  const label = isOn ? formatSpoken(state.remainingMs) : 'Minuteur éteint';

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* Le vortex, au ras du bord haut, comme sur la façade d'origine */}
        <VortexPortal width={width} height={portalHeight} phase={state.phase} />

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
              {/* Émetteur : la barre traverse toute la façade, deux LED
                  blanches au centre et deux rouges aux extrémités */}
              <Emitter width={width} />

              {/* Jours */}
              <Window inset={10}>
                <Text style={styles.caption}>DAYS</Text>
                <View style={styles.row}>
                  {DAY_DIGITS.map((cell) => (
                    <Digit key={`${cell.matrix}-${cell.row}`} cell={cell} height={dayDigit} />
                  ))}
                </View>
              </Window>

              {/* Molette */}
              <PowerDial size={dialSize} />

              {/* Heures, minutes, secondes, sur bande rétroéclairée */}
              <View style={styles.bandBlock}>
                <View style={styles.bandCaptions}>
                  <Text style={styles.caption}>HRS</Text>
                  <Text style={styles.caption}>MINS</Text>
                  <Text style={styles.caption}>SECS</Text>
                </View>
                <DisplayBand width={width} height={bandHeight}>
                  <View style={styles.timeRow}>
                    <Digit cell={HOURS.tens} height={timeDigit} />
                    <Digit cell={HOURS.units} height={timeDigit} />
                    <Colon
                      columns={[1, 2]}
                      size={timeDigit * 0.1}
                      spread={timeDigit * 0.42}
                    />
                    <Digit cell={MINUTES.tens} height={timeDigit} />
                    <Digit cell={MINUTES.units} height={timeDigit} />
                    <Colon
                      columns={[3, 4]}
                      size={timeDigit * 0.1}
                      spread={timeDigit * 0.42}
                    />
                    <Digit cell={SECONDS.tens} height={timeDigit} />
                    <Digit cell={SECONDS.units} height={timeDigit} />
                  </View>
                </DisplayBand>
              </View>

              {/* Témoins et bargraphes, à même la façade */}
              <View style={[styles.middle, { height: barHeight }]}>
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
                  <BarGraph
                    cell={BARGRAPH_LEFT}
                    width={28}
                    ledHeight={barSegment}
                    gap={barGap}
                  />
                  <View style={[styles.ladder, { height: barHeight - 10 }]}>
                    {Array.from({ length: 9 }, (_, index) => (
                      <View key={index} style={styles.rung} />
                    ))}
                  </View>
                  <BarGraph
                    cell={BARGRAPH_RIGHT}
                    width={28}
                    ledHeight={barSegment}
                    gap={barGap}
                  />
                </View>
              </View>
            </View>

            {/* Pavé */}
            <View style={styles.pad}>
              <View style={styles.keypadPanel}>
                <PadButton
                  label="1"
                  large
                  onPress={actions.increase}
                  accessibilityLabel="Augmenter"
                />
                <PadButton
                  label="4"
                  large
                  letters="GHI"
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingTop: 2, alignItems: 'flex-start' },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(216, 216, 216, 0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpPressed: { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
  helpGlyph: { color: COLORS.text, fontSize: 16, fontWeight: '800', lineHeight: 19 },
  stack: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  // L'objet est dense : des écarts fixes, et le bloc centré sur la hauteur
  // restante. `space-evenly` étalait les rangées sur tout l'écran.
  panel: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  caption: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  // La bande touche les deux bords : c'est une découpe dans la façade, pas
  // un bloc posé dessus.
  bandBlock: { width: '100%', alignItems: 'center' },
  bandCaptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '86%',
    marginBottom: 5,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 18,
  },
  statusColumn: { justifyContent: 'space-between', gap: 14 },
  bargraphs: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ladder: { alignItems: 'center', justifyContent: 'space-between' },
  rung: { width: 11, height: 2, borderRadius: 1, backgroundColor: COLORS.ladder },
  pad: { width: '100%', gap: 10, paddingHorizontal: 12, paddingBottom: 6 },
  // Le pavé 1 / 4 est sur une platine rapportée, légèrement plus claire.
  keypadPanel: {
    alignSelf: 'flex-start',
    gap: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.keypadPanel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.keypadPanelEdge,
  },
  padRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});
