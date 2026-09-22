import { memo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../theme';

/**
 * Notice d'utilisation.
 *
 * La façade reprend les sigles du prop — PWR, FCN, END — qui ne disent rien à
 * qui n'a pas l'objet en main. Des commandes qu'on ne comprend pas passent
 * pour des commandes qui ne marchent pas, donc la notice est accessible en
 * permanence depuis l'écran principal.
 */

type Entry = {
  key: string;
  title: string;
  detail: string;
};

const STEPS: readonly string[] = [
  'Appuyer sur PWR pour allumer le minuteur.',
  'Appuyer sur FCN pour choisir le champ à régler : secondes, minutes, heures, puis jours. Le champ sélectionné clignote.',
  'Régler la valeur avec 1 et 4.',
  'Appuyer sur END pour lancer le saut.',
];

const BUTTONS: readonly Entry[] = [
  {
    key: 'PWR',
    title: 'Alimentation',
    detail:
      "Allume et éteint le minuteur. Répond toujours, y compris en plein décompte et sur un minuteur bloqué.",
  },
  {
    key: 'FCN',
    title: 'Champ à régler',
    detail:
      'Passe au champ suivant : secondes, minutes, heures, jours, puis sortie. Le champ en cours de réglage clignote.',
  },
  { key: '1', title: 'Augmenter', detail: 'Ajoute une unité au champ sélectionné.' },
  { key: '4', title: 'Diminuer', detail: 'Retire une unité au champ sélectionné.' },
  {
    key: 'END',
    title: 'Lancer, ou sauter au hasard',
    detail:
      "À l'arrêt, lance le décompte réglé. Pendant un décompte, interrompt tout et repart sur une durée tirée au sort.",
  },
  {
    key: 'NAME\nMENU',
    title: 'Burnout',
    detail:
      "Pendant un décompte, force le saut et n'accorde plus que quatre-vingt-dix secondes de sursis. À la toute dernière seconde, un nouvel appui rattrape le coup et relance un décompte tiré au sort. Sinon le minuteur meurt.",
  },
];

/** Les deux sauts se ressemblent : la notice doit les séparer clairement. */
const JUMPS: readonly Entry[] = [
  {
    key: 'END',
    title: 'Saut au hasard',
    detail:
      'Le décompte repart immédiatement sur une nouvelle durée, sans limite de temps. Le minuteur reste en fonctionnement normal.',
  },
  {
    key: 'NAME\nMENU',
    title: 'Saut forcé, puis burnout',
    detail:
      "Le décompte est remplacé par quatre-vingt-dix secondes de sursis. Les paliers sonores s'enchaînent, les témoins passent au fixe l'un après l'autre. C'est un compte à rebours de survie, pas un décompte ordinaire.",
  },
];

/** Ce que disent les quatre lampes du bandeau supérieur. */
const LAMPS: readonly Entry[] = [
  {
    key: 'BLANCHES',
    title: 'Les deux du centre',
    detail:
      "S'allument à l'armement, juste avant le saut. Elles alternent ensuite dans les six dernières secondes du décompte, puis restent allumées toutes les deux sous deux secondes.",
  },
  {
    key: 'ROUGES',
    title: 'Les deux des extrémités',
    detail: "Ne s'allument qu'à l'ouverture du vortex, au moment du saut forcé.",
  },
];

export type HelpSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function HelpSheetView({ visible, onClose }: HelpSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />

        <View style={styles.sheet}>
          <View style={styles.grip} />
          <Text style={styles.heading}>Notice</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Régler un décompte</Text>
            {STEPS.map((step, index) => (
              <View key={step} style={styles.step}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Les commandes</Text>
            {BUTTONS.map((entry) => (
              <View key={entry.key} style={styles.row}>
                <View style={styles.glyph}>
                  <Text style={styles.glyphText}>{entry.key}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{entry.title}</Text>
                  <Text style={styles.rowDetail}>{entry.detail}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
              Les deux sauts
            </Text>
            {JUMPS.map((entry) => (
              <View key={entry.key} style={styles.row}>
                <View style={styles.glyph}>
                  <Text style={styles.glyphText}>{entry.key}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{entry.title}</Text>
                  <Text style={styles.rowDetail}>{entry.detail}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
              Les lampes du bandeau
            </Text>
            {LAMPS.map((entry) => (
              <View key={entry.key} style={styles.row}>
                <View style={styles.glyph}>
                  <Text style={styles.glyphText}>{entry.key}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{entry.title}</Text>
                  <Text style={styles.rowDetail}>{entry.detail}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.sectionTitle, styles.sectionSpacing]}>La molette</Text>
            <Text style={styles.rowDetail}>
              Elle se tourne au doigt et règle l&apos;intensité de l&apos;arc lumineux. Pendant les
              animations, seule la lumière bouge : la molette garde votre réglage.
            </Text>

            <Text style={styles.footnote}>
              Réplique du minuteur de la série Sliders. Hommage de fan, sans affiliation ni
              licence officielle.
            </Text>
          </ScrollView>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
            <Text style={styles.closeText}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.72)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '86%',
    backgroundColor: '#101010',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: StyleSheet.hairlineWidth * 3,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 26,
  },
  grip: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    marginBottom: 14,
  },
  heading: { color: COLORS.text, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: 18 },
  sectionTitle: {
    color: COLORS.led,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionSpacing: { marginTop: 24 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  stepNumber: {
    color: COLORS.led,
    fontSize: 13,
    fontWeight: '800',
    width: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepText: { color: 'rgba(242, 242, 242, 0.84)', fontSize: 14, lineHeight: 20, flex: 1 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  glyph: {
    width: 62,
    minHeight: 36,
    borderRadius: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(242, 242, 242, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  glyphText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 13,
  },
  rowText: { flex: 1 },
  rowTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  rowDetail: { color: 'rgba(242, 242, 242, 0.7)', fontSize: 13.5, lineHeight: 19 },
  footnote: {
    color: 'rgba(242, 242, 242, 0.4)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 26,
    fontStyle: 'italic',
  },
  close: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  closePressed: { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
  closeText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
});

export const HelpSheet = memo(HelpSheetView);
