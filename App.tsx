import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BarGraph } from './src/components/BarGraph';
import { Colon } from './src/components/Colon';
import { Digit } from './src/components/Digit';
import { PadButton } from './src/components/PadButton';
import { PowerDial } from './src/components/PowerDial';
import { StatusLed } from './src/components/StatusLed';
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

  // Toutes les tailles dérivent de la largeur : l'interface tient aussi bien
  // sur un petit écran que sur une tablette, sans hauteur codée en dur.
  const timeDigit = Math.min(width * 0.185, height * 0.1);
  const dayDigit = timeDigit * 0.5;
  const dialSize = Math.min(width * 0.44, height * 0.19);

  const isOn = state.phase !== 'off';
  const label = isOn ? formatSpoken(state.remainingMs) : 'Minuteur éteint';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar hidden />

        <View
          style={styles.stack}
          accessible
          accessibilityRole="timer"
          accessibilityLabel={label}>
          <View style={styles.panel}>
          {/* Jours */}
          <View style={styles.block}>
            <Text style={styles.caption}>DAYS</Text>
            <View style={styles.row}>
              {DAY_DIGITS.map((cell) => (
                <Digit key={`${cell.matrix}-${cell.row}`} cell={cell} height={dayDigit} />
              ))}
            </View>
          </View>

          {/* Potentiomètre */}
          <PowerDial size={dialSize} />

          {/* Heures, minutes, secondes */}
          <View style={styles.timeRow}>
            <TimeGroup caption="HRS" cells={[HOURS.tens, HOURS.units]} height={timeDigit} />
            <Colon columns={[1, 2]} size={timeDigit * 0.13} />
            <TimeGroup caption="MINS" cells={[MINUTES.tens, MINUTES.units]} height={timeDigit} />
            <Colon columns={[3, 4]} size={timeDigit * 0.13} />
            <TimeGroup caption="SECS" cells={[SECONDS.tens, SECONDS.units]} height={timeDigit} />
          </View>

          {/* Témoins et bargraphes */}
          <View style={styles.middle}>
            <View style={styles.statusColumn}>
              {STATUS_LEDS.map((led) => (
                <StatusLed
                  key={led.label}
                  label={led.label}
                  column={led.column}
                  color={led.color}
                  width={30}
                />
              ))}
            </View>
            <View style={styles.bargraphs}>
              <BarGraph cell={BARGRAPH_LEFT} width={38} ledHeight={12} />
              <View style={styles.ladder}>
                {Array.from({ length: 9 }, (_, index) => (
                  <Text key={index} style={styles.ladderRung}>
                    --
                  </Text>
                ))}
              </View>
              <BarGraph cell={BARGRAPH_RIGHT} width={38} ledHeight={12} />
            </View>
          </View>
          </View>

          {/* Pavé */}
          <View style={styles.pad}>
            <View style={styles.padColumn}>
              <PadButton label="1" large onPress={actions.increase} accessibilityLabel="Augmenter" />
              <PadButton label="4" large onPress={actions.decrease} accessibilityLabel="Diminuer" />
            </View>
            <View style={styles.padRow}>
              <PadButton label="PWR" onPress={actions.power} accessibilityLabel="Allumer ou éteindre" />
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
              <PadButton label="END" onPress={actions.end} accessibilityLabel="Lancer le saut" />
            </View>
          </View>
        </View>
      </SafeAreaView>
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
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Le bloc d'affichage occupe tout l'espace au-dessus du pavé et répartit
  // ses quatre rangées à l'intérieur : le pavé reste sous le pouce, sans
  // laisser de vide au milieu sur les écrans très hauts.
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  statusColumn: { justifyContent: 'space-between', gap: 22 },
  bargraphs: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ladder: { alignItems: 'center' },
  ladderRung: { color: COLORS.text, letterSpacing: -2, fontSize: 12, lineHeight: 14 },
  pad: { width: '100%', gap: 12, paddingBottom: 4 },
  padColumn: { alignItems: 'flex-start', gap: 10 },
  padRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});
