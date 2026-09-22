/**
 * Palette et matières du minuteur.
 *
 * La référence visuelle est le rendu de l'objet sur fond noir : ce n'est pas
 * le fond qui porte la matière, ce sont les pièces. Chaque élément a son
 * traitement — collerette biseautée de la molette, gouttières des bargraphes,
 * bande rétroéclairée des afficheurs, contours des touches.
 */
export const COLORS = {
  /** Fond : noir franc, sans dégradé ni texture. */
  background: '#000000',

  /* --- Afficheurs sept segments --- */
  /** Segment allumé. */
  led: '#ff1e1e',
  /** Segment éteint : visible, mais à peine. */
  ledOff: 'rgba(96, 8, 8, 0.85)',
  /** Rétroéclairage de la bande horaire, du plus sombre au plus vif. */
  displayBackDark: '#2c0000',
  displayBackLit: '#6b0000',
  /** Liseré clair sur les arêtes de la bande. */
  displayEdge: 'rgba(255, 228, 228, 0.55)',

  /* --- Témoins latéraux --- */
  red: '#ff2020',
  redOff: '#3a3a3a',
  yellow: '#ffd21e',
  yellowOff: '#3a3a3a',
  green: '#2bff55',
  greenOff: '#3a3a3a',

  /* --- Bargraphes --- */
  /** Segment allumé. */
  bar: '#2bff4f',
  /** Gouttière : le canal sombre dans lequel les segments sont encastrés. */
  barChannel: '#1c1c1c',
  barChannelEdge: '#2e2e2e',
  /** Échelle gravée entre les deux gouttières. */
  ladder: '#5a5a5a',

  /* --- Molette --- */
  /** Collerette extérieure, éclairée en haut à gauche. */
  knobRingLight: '#4a4a4a',
  knobRingDark: '#151515',
  /** Face du bouton. */
  knobFaceLight: '#3c3c3c',
  knobFaceDark: '#111111',
  /** Fente diagonale. */
  knobSlot: '#2a2a2a',
  knobSlotEdge: '#555555',

  /* --- Arc lumineux --- */
  strip: '#ff2020',
  stripHot: '#ff8a6a',
  stripOff: 'rgba(40, 4, 4, 0.9)',

  /* --- Émetteur --- */
  vortexWhite: '#fdf6e8',
  vortexRed: '#ff2f2f',

  /* --- Vortex d'arrière-plan --- */
  vortexGlow: '#3d7dff',
  vortexCore: '#cfe4ff',

  /* --- Touches --- */
  /** Contour biseauté des touches, clair en haut. */
  keyEdgeLight: '#9a9a9a',
  keyEdgeDark: '#4a4a4a',
  keyFace: '#141414',
  keyFacePressed: '#2a2a2a',
  /** Panneau légèrement plus clair sous le pavé 1 / 4. */
  keypadPanel: '#141414',
  keypadPanelEdge: '#2c2c2c',

  /* --- Sérigraphie --- */
  text: '#d8d8d8',
  textDim: '#8a8a8a',
} as const;

/** Couleur d'un témoin selon son état. */
export const STATUS_COLORS = {
  red: { on: COLORS.red, off: COLORS.redOff },
  yellow: { on: COLORS.yellow, off: COLORS.yellowOff },
  green: { on: COLORS.green, off: COLORS.greenOff },
} as const;
