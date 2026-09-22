/** Palette du minuteur, calée sur les composants de la réplique matérielle. */
export const COLORS = {
  /** Fond de la coque. */
  background: '#000000',
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
  /** Arc du potentiomètre. */
  strip: '#ff2d2d',
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
