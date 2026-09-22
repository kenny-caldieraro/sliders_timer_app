/**
 * Câblage des deux matrices MAX7219, relevé sur le firmware de la réplique.
 *
 * Matrice 0
 *   lignes 0-1  afficheurs des heures
 *   lignes 2-3  afficheurs des minutes
 *   lignes 4-5  afficheurs des secondes
 *   ligne  6    colonnes 1-4 : les quatre points des deux séparateurs
 *
 * Matrice 1
 *   lignes 0-2  afficheurs des jours (centaines, dizaines, unités)
 *   ligne  3    bargraphe gauche, un bit par LED
 *   ligne  4    bargraphe droit
 *   ligne  5    colonnes 3-5 : témoins TAU (jaune), DELTA (rouge), ZETA (vert)
 *   ligne  6    chenillard des extrémités
 *   ligne  7    colonnes 1-4 : LED de l'émetteur
 */

export type MatrixIndex = 0 | 1;

export type Cell = { matrix: MatrixIndex; row: number };

/** Les six afficheurs HH MM SS, de gauche à droite. */
export const TIME_DIGITS: readonly Cell[] = [
  { matrix: 0, row: 0 },
  { matrix: 0, row: 1 },
  { matrix: 0, row: 2 },
  { matrix: 0, row: 3 },
  { matrix: 0, row: 4 },
  { matrix: 0, row: 5 },
];

/** Les trois afficheurs de jours, de gauche à droite. */
export const DAY_DIGITS: readonly Cell[] = [
  { matrix: 1, row: 0 },
  { matrix: 1, row: 1 },
  { matrix: 1, row: 2 },
];

export const HOURS = { tens: TIME_DIGITS[0]!, units: TIME_DIGITS[1]! } as const;
export const MINUTES = { tens: TIME_DIGITS[2]!, units: TIME_DIGITS[3]! } as const;
export const SECONDS = { tens: TIME_DIGITS[4]!, units: TIME_DIGITS[5]! } as const;

/** Séparateurs : quatre points, deux par séparateur. */
export const COLON_ROW = { matrix: 0 as MatrixIndex, row: 6 };
export const COLON_COLUMNS = [1, 2, 3, 4] as const;

/** Bargraphes verticaux, huit LED chacun. */
export const BARGRAPH_LEFT = { matrix: 1 as MatrixIndex, row: 3 };
export const BARGRAPH_RIGHT = { matrix: 1 as MatrixIndex, row: 4 };

/** Témoins latéraux. Les colonnes viennent des structures `LED` du firmware. */
export const STATUS_ROW = { matrix: 1 as MatrixIndex, row: 5 };
export const STATUS_LEDS = [
  { label: 'TAU', column: 3, color: 'yellow' },
  { label: 'DELTA', column: 4, color: 'red' },
  { label: 'ZETA', column: 5, color: 'green' },
] as const;

/** Chenillard des extrémités : valeur constante quand le minuteur est allumé. */
export const EDGE_ROW = { matrix: 1 as MatrixIndex, row: 6 };
export const EDGE_PATTERN = 0x78;

/**
 * Masque d'une colonne, convention `LedControl` : la colonne 0 est le bit de
 * poids fort. Ré-exporté ici pour les composants qui lisent une ligne brute.
 */
export const columnMaskOf = (column: number) => 0x80 >> column;

/** LED de l'émetteur, allumées dans les dernières secondes. */
export const EMITTER_ROW = { matrix: 1 as MatrixIndex, row: 7 };
export const EMITTER_COLUMNS = [1, 2, 3, 4] as const;

/**
 * Cadences de clignotement, en millisecondes.
 * Relevées sur les structures `LED` du firmware — elles ne sont pas arbitraires,
 * c'est ce décalage entre les quatre périodes qui donne son rythme à l'objet.
 */
export const BLINK_INTERVALS = {
  red: 600,
  yellow: 250,
  green: 200,
  colon: 150,
} as const;

/** Nombre de LED de l'arc du potentiomètre (bandeau NeoPixel). */
export const NEOPIXEL_COUNT = 7;
