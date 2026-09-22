import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

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
 * Répartition verticale de la façade.
 *
 * Ces fractions ne sont pas choisies : elles sont relevées au pixel sur une
 * capture de la façade, puis normalisées pour totaliser 1. La hauteur de
 * chaque bloc s'en déduit, quelle que soit la taille de l'écran — c'est ce qui
 * garantit que les rapports entre les éléments restent ceux de l'objet.
 */
const LAYOUT = {
  days: 0.0856,
  gapAfterDays: 0.0121,
  dial: 0.2679,
  gapAfterDial: 0.0066,
  captions: 0.0241,
  band: 0.1284,
  gapAfterBand: 0.0143,
  indicators: 0.2195,
  gapAfterIndicators: 0.0099,
  keypad: 0.1526,
  gapAfterKeypad: 0.0154,
  keys: 0.0637,
} as const;

/**
 * Les chiffres remplissent presque toute la bande, en hauteur comme en
 * largeur : c'est ce qui donne l'afficheur massif de la façade. Un afficheur
 * est 0,656 fois plus large que haut, six d'affilée plus deux séparateurs
 * font 4,35 fois cette hauteur.
 */
const DIGIT_IN_BAND = 0.82;
const DIGIT_ROW_RATIO = 6 * 0.656 + 0.42;

/** Hauteur de la barre de l'émetteur, au-dessus de tout le reste. */
const EMITTER_HEIGHT = 26;

function Timer() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { state, actions } = useTimer();
  const [helpVisible, setHelpVisible] = useState(false);

  const openHelp = useCallback(() => setHelpVisible(true), []);
  const closeHelp = useCallback(() => setHelpVisible(false), []);

  const usable = height - insets.top - insets.bottom;
  const content = usable - EMITTER_HEIGHT - 10;
  const block = (fraction: number) => content * fraction;

  const bandHeight = block(LAYOUT.band);
  const timeDigit = Math.min(
    bandHeight * DIGIT_IN_BAND,
    (width * 0.9) / DIGIT_ROW_RATIO,
  );
  const dialSize = block(LAYOUT.dial);
  const daysHeight = block(LAYOUT.days);
  const barHeight = block(LAYOUT.indicators);
  const keypadHeight = block(LAYOUT.keypad);
  const keyHeight = block(LAYOUT.keys);

  // Deux touches et leur écart dans la platine du pavé.
  const largeKeyHeight = (keypadHeight - 18) / 2;

  /*
   * Dimensions d'une LED, communes aux bargraphes et aux témoins latéraux :
   * sur la façade ce sont les mêmes composants derrière le même diffuseur.
   * Huit segments et sept écarts doivent tenir dans la hauteur du bloc.
   */
  const ledGap = 5;
  const ledWidth = width * 0.095;
  const ledHeight = (barHeight - 8 - 7 * ledGap) / 8;
  const portalHeight = Math.max(height * 0.07, 54);

  const isOn = state.phase !== 'off';
  const label = isOn ? formatSpoken(state.remainingMs) : 'Minuteur éteint';

  return (
    <View style={styles.root}>
      {/* Le vortex, au ras du bord haut, comme sur la façade d'origine */}
      <VortexPortal width={width} height={portalHeight} phase={state.phase} />

      <View
        style={[styles.face, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={label}>
        <StatusBar hidden />

        {/* Émetteur : la barre traverse toute la façade */}
        <Emitter width={width} />
        <View style={{ height: 10 }} />

        {/* Jours */}
        <Text style={styles.caption}>DAYS</Text>
        <Window inset={8} style={{ marginTop: 2 }}>
          <View style={styles.row}>
            {DAY_DIGITS.map((cell) => (
              <Digit
                key={`${cell.matrix}-${cell.row}`}
                cell={cell}
                height={daysHeight * 0.62}
              />
            ))}
          </View>
        </Window>

        <View style={{ height: block(LAYOUT.gapAfterDays) }} />

        {/* Molette */}
        <PowerDial size={dialSize} />

        <View style={{ height: block(LAYOUT.gapAfterDial) }} />

        {/* Heures, minutes, secondes */}
        <View style={[styles.captions, { height: block(LAYOUT.captions) }]}>
          <Text style={styles.caption}>HRS</Text>
          <Text style={styles.caption}>MINS</Text>
          <Text style={styles.caption}>SECS</Text>
        </View>
        <DisplayBand width={width} height={bandHeight}>
          <View style={styles.row}>
            <Digit cell={HOURS.tens} height={timeDigit} />
            <Digit cell={HOURS.units} height={timeDigit} />
            <Colon columns={[1, 2]} size={timeDigit * 0.15} spread={timeDigit * 0.52} />
            <Digit cell={MINUTES.tens} height={timeDigit} />
            <Digit cell={MINUTES.units} height={timeDigit} />
            <Colon columns={[3, 4]} size={timeDigit * 0.15} spread={timeDigit * 0.52} />
            <Digit cell={SECONDS.tens} height={timeDigit} />
            <Digit cell={SECONDS.units} height={timeDigit} />
          </View>
        </DisplayBand>

        <View style={{ height: block(LAYOUT.gapAfterBand) }} />

        {/*
          Témoins et bargraphes. Largeurs relevées sur la façade, en fraction
          de la largeur d'écran : gouttière 11,5 %, témoin 8 %, échelon 5 %.
        */}
        <View
          style={[
            styles.indicators,
            { height: barHeight, paddingLeft: width * 0.11, paddingRight: width * 0.09 },
          ]}>
          <View style={[styles.statusColumn, { height: barHeight * 0.9 }]}>
            {STATUS_LEDS.map((led) => (
              <StatusLed
                key={led.label}
                label={led.label}
                column={led.column}
                color={led.color}
                width={ledWidth}
                height={ledHeight}
              />
            ))}
          </View>
          <View style={styles.bargraphs}>
            <BarGraph
              cell={BARGRAPH_LEFT}
              width={ledWidth}
              ledHeight={ledHeight}
              gap={ledGap}
            />
            <View style={[styles.ladder, { height: barHeight * 0.86 }]}>
              {Array.from({ length: 13 }, (_, index) => (
                <View key={index} style={[styles.rung, { width: width * 0.05 }]} />
              ))}
            </View>
            <BarGraph
              cell={BARGRAPH_RIGHT}
              width={ledWidth}
              ledHeight={ledHeight}
              gap={ledGap}
            />
          </View>
        </View>

        <View style={{ height: block(LAYOUT.gapAfterIndicators) }} />

        {/* Pavé 1 / 4, sur sa platine */}
        <View style={[styles.keypadPanel, { height: keypadHeight }]}>
          <PadButton
            label="1"
            large
            width={width * 0.26}
            height={largeKeyHeight}
            onPress={actions.increase}
            accessibilityLabel="Augmenter"
          />
          <PadButton
            label="4"
            large
            letters="GHI"
            width={width * 0.26}
            height={largeKeyHeight}
            onPress={actions.decrease}
            accessibilityLabel="Diminuer"
          />
        </View>

        <View style={{ height: block(LAYOUT.gapAfterKeypad) }} />

        {/* Rangée de commande */}
        <View style={styles.keyRow}>
          <PadButton
            label="PWR"
            width={width * 0.2}
            height={keyHeight}
            onPress={actions.power}
            accessibilityLabel="Allumer ou éteindre"
          />
          <PadButton
            label="FCN"
            width={width * 0.2}
            height={keyHeight}
            onPress={actions.selectField}
            accessibilityLabel="Choisir le champ à régler"
          />
          {/* La façade du prop porte « NAME / MENU ». Sur la réplique
              matérielle, le burnout a son propre bouton ; ici il prend la
              place de cette touche, qui ne servait à rien. */}
          <PadButton
            label={'NAME\nMENU'}
            width={width * 0.2}
            height={keyHeight}
            onPress={actions.vortex}
            accessibilityLabel="Forcer le saut et passer en burnout"
          />
          <PadButton
            label="END"
            width={width * 0.2}
            height={keyHeight}
            onPress={actions.end}
            accessibilityLabel="Lancer le saut"
          />
        </View>
      </View>

      {/* La notice ne prend pas de place dans la façade : elle se superpose. */}
      <Pressable
        onPress={openHelp}
        accessibilityRole="button"
        accessibilityLabel="Afficher la notice"
        hitSlop={12}
        style={({ pressed }) => [
          styles.helpButton,
          { top: insets.top + 6 },
          pressed && styles.helpPressed,
        ]}>
        <Text style={styles.helpGlyph}>?</Text>
      </Pressable>

      <HelpSheet visible={helpVisible} onClose={closeHelp} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Timer />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  face: { flex: 1, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  caption: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  captions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '86%',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusColumn: { justifyContent: 'space-between' },
  bargraphs: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ladder: { alignItems: 'center', justifyContent: 'space-between' },
  rung: { height: 2, borderRadius: 1, backgroundColor: COLORS.ladder },
  // Le pavé 1 / 4 est sur une platine rapportée, légèrement plus claire.
  keypadPanel: {
    alignSelf: 'flex-start',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: COLORS.keypadPanel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.keypadPanelEdge,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  helpButton: {
    position: 'absolute',
    left: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(216, 216, 216, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpPressed: { backgroundColor: 'rgba(255, 255, 255, 0.14)' },
  helpGlyph: { color: COLORS.text, fontSize: 15, fontWeight: '800', lineHeight: 18 },
});
