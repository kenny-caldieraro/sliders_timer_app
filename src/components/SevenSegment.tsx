import { memo } from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';

import { SEG_A, SEG_B, SEG_C, SEG_D, SEG_DP, SEG_E, SEG_F, SEG_G } from '../hardware/segments';

/**
 * Un afficheur sept segments, rendu en SVG.
 *
 * Remplace `rn-seven-segment-display`, dont la dernière publication date de
 * 2022 et qui ne savait afficher que des caractères. Ici on prend l'octet de
 * segments brut : c'est ce qui permet de rejouer les images d'animation du
 * firmware, dont la plupart ne correspondent à aucun caractère.
 *
 * Géométrie : segments hexagonaux à pointes, dans une boîte de 118 × 180.
 *
 * Le rapport largeur/hauteur est volontairement proche de 1 : c'est celui des
 * afficheurs du minuteur, qui sont larges et trapus. Une boîte étroite — le
 * rapport habituel d'un afficheur d'horloge — donne des chiffres filiformes
 * qui ne remplissent jamais la bande.
 */

const VIEW_WIDTH = 118;
const VIEW_HEIGHT = 180;
/** Largeur occupée par les segments ; le reste est réservé au point. */
const BODY_WIDTH = 104;
export const SEGMENT_ASPECT = VIEW_WIDTH / VIEW_HEIGHT;

const THICKNESS = 18;
const GAP = 5;

/** Segment horizontal : hexagone à pointes gauche et droite. */
const horizontal = (x: number, y: number, length: number) => {
  const t = THICKNESS;
  return [
    [x + t / 2, y],
    [x + length - t / 2, y],
    [x + length, y + t / 2],
    [x + length - t / 2, y + t],
    [x + t / 2, y + t],
    [x, y + t / 2],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');
};

/** Segment vertical : hexagone à pointes haute et basse. */
const vertical = (x: number, y: number, length: number) => {
  const t = THICKNESS;
  return [
    [x, y + t / 2],
    [x + t / 2, y],
    [x + t, y + t / 2],
    [x + t, y + length - t / 2],
    [x + t / 2, y + length],
    [x, y + length - t / 2],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(' ');
};

const H_X = THICKNESS / 2 + GAP;
const H_LENGTH = BODY_WIDTH - THICKNESS - 2 * GAP;
const MIDDLE_Y = (VIEW_HEIGHT - THICKNESS) / 2;
const BOTTOM_Y = VIEW_HEIGHT - THICKNESS - GAP;

const LEFT_X = GAP;
const RIGHT_X = BODY_WIDTH - THICKNESS - GAP;
const UPPER_Y = THICKNESS + 2 * GAP;
const V_LENGTH = MIDDLE_Y - GAP - UPPER_Y;
const LOWER_Y = MIDDLE_Y + THICKNESS + GAP;

const SEGMENTS: readonly { bit: number; points: string }[] = [
  { bit: SEG_A, points: horizontal(H_X, GAP, H_LENGTH) },
  { bit: SEG_B, points: vertical(RIGHT_X, UPPER_Y, V_LENGTH) },
  { bit: SEG_C, points: vertical(RIGHT_X, LOWER_Y, V_LENGTH) },
  { bit: SEG_D, points: horizontal(H_X, BOTTOM_Y, H_LENGTH) },
  { bit: SEG_E, points: vertical(LEFT_X, LOWER_Y, V_LENGTH) },
  { bit: SEG_F, points: vertical(LEFT_X, UPPER_Y, V_LENGTH) },
  { bit: SEG_G, points: horizontal(H_X, MIDDLE_Y, H_LENGTH) },
];

export type SevenSegmentProps = {
  /** Octet de segments, format MAX7219. */
  value: number;
  /** Hauteur de l'afficheur en points. */
  height: number;
  /** Couleur d'un segment allumé. */
  onColor: string;
  /** Couleur d'un segment éteint — jamais totalement noire, comme un vrai LED. */
  offColor: string;
  /** Atténuation globale, de 0 à 1 (fondu d'allumage). */
  intensity?: number;
};

function SevenSegmentView({
  value,
  height,
  onColor,
  offColor,
  intensity = 1,
}: SevenSegmentProps) {
  const width = height * SEGMENT_ASPECT;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
      {SEGMENTS.map(({ bit, points }) => {
        const on = (value & bit) !== 0;
        return (
          <Polygon
            key={bit}
            points={points}
            fill={on ? onColor : offColor}
            fillOpacity={on ? intensity : 1}
            // Halo : un contour large et translucide suffit à donner la
            // diffusion d'une vraie LED, sans le coût d'un filtre SVG.
            stroke={on ? onColor : 'none'}
            strokeWidth={on ? 6 : 0}
            strokeOpacity={on ? 0.25 * intensity : 0}
            strokeLinejoin="round"
          />
        );
      })}
      <Circle
        cx={BODY_WIDTH + 8}
        cy={VIEW_HEIGHT - 11}
        r={7}
        fill={(value & SEG_DP) !== 0 ? onColor : offColor}
        fillOpacity={(value & SEG_DP) !== 0 ? intensity : 1}
      />
    </Svg>
  );
}

export const SevenSegment = memo(SevenSegmentView);
