/**
 * Encodage sept segments du MAX7219, identique à celui du firmware Arduino.
 *
 *      AAAA
 *     F    B
 *     F    B
 *      GGGG
 *     E    C
 *     E    C
 *      DDDD   DP
 *
 * Un afficheur tient dans un octet : bit 7 = point décimal, bits 6 → 0 = A → G.
 */

export const SEG_DP = 0b1000_0000;
export const SEG_A = 0b0100_0000;
export const SEG_B = 0b0010_0000;
export const SEG_C = 0b0001_0000;
export const SEG_D = 0b0000_1000;
export const SEG_E = 0b0000_0100;
export const SEG_F = 0b0000_0010;
export const SEG_G = 0b0000_0001;

/** Ordre de rendu : le point décimal en dernier. */
export const SEGMENT_ORDER = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G, SEG_DP] as const;

export type SegmentName = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'dp';

export const SEGMENT_NAMES: readonly SegmentName[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];

/** Chiffres 0-9, repris de `lc.setDigit`. */
const DIGITS = [0x7e, 0x30, 0x6d, 0x79, 0x33, 0x5b, 0x5f, 0x70, 0x7f, 0x7b] as const;

/** Convertit un chiffre 0-9 en octet de segments. Hors plage : afficheur éteint. */
export function digitToSegments(digit: number): number {
  return DIGITS[digit] ?? 0x00;
}

/** Vrai si ce segment est allumé dans l'octet donné. */
export function hasSegment(value: number, segment: number): boolean {
  return (value & segment) !== 0;
}

/** Les huit bits d'un octet de segments, dans l'ordre A → G puis point. */
export function toSegmentFlags(value: number): boolean[] {
  return SEGMENT_ORDER.map((segment) => (value & segment) !== 0);
}
