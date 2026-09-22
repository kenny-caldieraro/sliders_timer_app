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
 * Géométrie : segments hexagonaux à pointes, dans une boîte de 112 × 180.
 */

const VIEW_WIDTH = 112;
const VIEW_HEIGHT = 180;
export const SEGMENT_ASPECT = VIEW_WIDTH / VIEW_HEIGHT;

const THICKNESS = 18;
const GAP = 3;

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

const H_LENGTH = 76;
const V_LENGTH = 54;
const RIGHT_X = 79;
const MIDDLE_Y = (VIEW_HEIGHT - THICKNESS) / 2;

const SEGMENTS: readonly { bit: number; points: string }[] = [
  { bit: SEG_A, points: horizontal(12, GAP, H_LENGTH) },
  { bit: SEG_B, points: vertical(RIGHT_X, 24, V_LENGTH) },
  { bit: SEG_C, points: vertical(RIGHT_X, 102, V_LENGTH) },
  { bit: SEG_D, points: horizontal(12, VIEW_HEIGHT - THICKNESS - GAP, H_LENGTH) },
  { bit: SEG_E, points: vertical(GAP, 102, V_LENGTH) },
  { bit: SEG_F, points: vertical(GAP, 24, V_LENGTH) },
  { bit: SEG_G, points: horizontal(12, MIDDLE_Y, H_LENGTH) },
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
        cx={VIEW_WIDTH - 8}
        cy={VIEW_HEIGHT - 12}
        r={7}
        fill={(value & SEG_DP) !== 0 ? onColor : offColor}
        fillOpacity={(value & SEG_DP) !== 0 ? intensity : 1}
      />
    </Svg>
  );
}

export const SevenSegment = memo(SevenSegmentView);
