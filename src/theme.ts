/** Palette du minuteur, calée sur les composants de la réplique matérielle. */
export const COLORS = {
  /** Fond de la coque. */
  background: '#0b0d10',
  /**
   * Châssis. Sur la réplique, le corps est un plastique gris-bleu et les
   * afficheurs sont encastrés derrière des fenêtres noires. Tout peindre en
   * noir uniforme écrase ce relief.
   */
  chassisTop: '#2b313a',
  chassisBottom: '#12161b',
  /** Fenêtre d'afficheur, en creux dans le châssis. */
  window: '#050607',
  /** Arêtes : lumière en haut, ombre en bas, comme une pièce moulée. */
  bevelLight: 'rgba(255, 255, 255, 0.10)',
  bevelDark: 'rgba(0, 0, 0, 0.65)',
  /** Afficheurs sept segments : LED rouges. */
  led: '#ff2d2d',
  /** Segment éteint — un vrai afficheur n'est jamais tout à fait noir. */
  ledOff: 'rgba(70, 8, 8, 1)',
  /** Témoins latéraux. */
  red: '#ff2020',
  redOff: 'rgba(70, 0, 0, 1)',
  yellow: '#ffd21e',
  yellowOff: 'rgba(66, 55, 0, 1)',
  green: '#22ff5a',
  greenOff: 'rgba(0, 62, 20, 1)',
  /** Bargraphes. */
  bar: '#22ff5a',
  barOff: 'rgba(0, 40, 13, 1)',
  /** Arc du potentiomètre : guide de lumière continu. */
  strip: '#ff2d2d',
  stripOff: 'rgba(48, 6, 6, 1)',
  /** Émetteur : deux sources blanches au centre, deux rouges aux extrémités. */
  vortexWhite: '#fdf6e8',
  vortexRed: '#ff2f2f',
  /** Vortex d'arrière-plan : bleu froid, cœur blanc. */
  vortexGlow: '#3d7dff',
  vortexCore: '#cfe4ff',
  /** Sérigraphie et contours. */
  text: '#f2f2f2',
  outline: '#f2f2f2',
  knob: '#0e0e0e',
  knobRing: 'rgba(38, 38, 38, 0.9)',
} as const;

/** Couleur d'un témoin selon son état. */
export const STATUS_COLORS = {
  red: { on: COLORS.red, off: COLORS.redOff },
  yellow: { on: COLORS.yellow, off: COLORS.yellowOff },
  green: { on: COLORS.green, off: COLORS.greenOff },
} as const;
