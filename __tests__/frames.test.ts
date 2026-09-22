import {
  BARGRAPH_END,
  BARGRAPH_NORMAL,
  BARGRAPH_OFF,
  BARGRAPH_POST_END,
  CHAR_TO_SEGMENTS,
  DISPLAY_FADE_FRAMES,
  DISPLAY_WRAP_FRAMES,
  GENSER_FRAMES,
  VERSION_TEXT,
  WRAP_BURNOUT_FRAMES,
} from '../src/animations/frames';
import { digitToSegments } from '../src/hardware/segments';

/**
 * Garde-fou sur les tables portées du firmware.
 *
 * `src/animations/frames.ts` est généré par `scripts/port-arduino-frames.py`.
 * Ces valeurs sont relevées à la main dans le `.ino` : si une régénération
 * décale ou tronque une table, ces tests tombent.
 */

describe('tables portées du firmware', () => {
  it('a le bon nombre d’images par séquence', () => {
    expect(GENSER_FRAMES).toHaveLength(8);
    expect(DISPLAY_FADE_FRAMES).toHaveLength(9);
    expect(DISPLAY_WRAP_FRAMES).toHaveLength(14);
    expect(WRAP_BURNOUT_FRAMES).toHaveLength(32);
    expect(BARGRAPH_POST_END.frames).toHaveLength(16);
    expect(BARGRAPH_NORMAL.frames).toHaveLength(24);
    expect(BARGRAPH_END.frames).toHaveLength(80);
    expect(BARGRAPH_OFF.frames).toHaveLength(1);
  });

  it('chaque image adresse six afficheurs sur la matrice 0 et cinq sur la matrice 1', () => {
    [...GENSER_FRAMES, ...DISPLAY_FADE_FRAMES, ...DISPLAY_WRAP_FRAMES].forEach((frame) => {
      expect(frame.r0).toHaveLength(6);
      expect(frame.r1).toHaveLength(5);
    });
    WRAP_BURNOUT_FRAMES.forEach((frame) => expect(frame).toHaveLength(6));
  });

  it('tous les octets tiennent sur huit bits', () => {
    const bytes = [
      ...GENSER_FRAMES.flatMap((f) => [...f.r0, ...f.r1]),
      ...DISPLAY_WRAP_FRAMES.flatMap((f) => [...f.r0, ...f.r1]),
      ...WRAP_BURNOUT_FRAMES.flat(),
      ...BARGRAPH_END.frames.flatMap((f) => [...f]),
    ];
    bytes.forEach((byte) => {
      expect(Number.isInteger(byte)).toBe(true);
      expect(byte).toBeGreaterThanOrEqual(0);
      expect(byte).toBeLessThanOrEqual(0xff);
    });
  });

  it('ouvre la séquence d’amorçage sur GENSER', () => {
    // Première ligne de GENSER_FRAMES dans le .ino.
    expect(GENSER_FRAMES[0]?.r0).toEqual([0x5e, 0x4f, 0x15, 0x5b, 0x4f, 0x05]);
    expect(GENSER_FRAMES[0]?.holdMs).toBe(400);
    expect(GENSER_FRAMES[0]?.clearPauseMs).toBe(40);
  });

  it('referme la séquence d’amorçage sur KENNY', () => {
    expect(GENSER_FRAMES[7]?.r0).toEqual([0x37, 0x4f, 0x15, 0x15, 0x33, 0x01]);
    expect(GENSER_FRAMES[7]?.holdMs).toBe(350);
  });

  it('fait descendre les tons de l’effet wrap de 5500 à 2500 Hz', () => {
    expect(DISPLAY_WRAP_FRAMES[0]?.toneFreq).toBe(5500);
    expect(DISPLAY_WRAP_FRAMES[9]?.toneFreq).toBe(5500);
    expect(DISPLAY_WRAP_FRAMES[10]?.toneFreq).toBe(2500);
    expect(DISPLAY_WRAP_FRAMES[13]?.toneFreq).toBe(2500);
  });

  it('trace le burnout d’un seul segment jusqu’à l’extinction', () => {
    expect(WRAP_BURNOUT_FRAMES[0]).toEqual([0x40, 0x00, 0x00, 0x00, 0x00, 0x00]);
    expect(WRAP_BURNOUT_FRAMES[5]).toEqual([0x40, 0x40, 0x40, 0x40, 0x40, 0x40]);
    expect(WRAP_BURNOUT_FRAMES[31]).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  });

  it('extrait les deux octets utiles de chaque image de bargraphe', () => {
    // IMAGES_NORMAL[1] = 0x0000000201000000 -> octet 3 = 0x01, octet 4 = 0x02
    expect(BARGRAPH_NORMAL.frames[0]).toEqual([0x00, 0x00]);
    expect(BARGRAPH_NORMAL.frames[1]).toEqual([0x01, 0x02]);
    expect(BARGRAPH_NORMAL.frames[2]).toEqual([0x81, 0x06]);
    expect(BARGRAPH_NORMAL.delayMs).toBe(20);
    expect(BARGRAPH_POST_END.delayMs).toBe(15);
  });
});

describe('encodage sept segments', () => {
  it('reprend la table du firmware pour les chiffres', () => {
    const expected = [0x7e, 0x30, 0x6d, 0x79, 0x33, 0x5b, 0x5f, 0x70, 0x7f, 0x7b];
    expected.forEach((value, digit) => expect(digitToSegments(digit)).toBe(value));
  });

  it('éteint l’afficheur hors de la plage 0-9', () => {
    expect(digitToSegments(-1)).toBe(0x00);
    expect(digitToSegments(10)).toBe(0x00);
  });

  it('accorde charToSeg et setDigit sur les chiffres', () => {
    for (let digit = 0; digit <= 9; digit += 1) {
      expect(CHAR_TO_SEGMENTS[String(digit)]).toBe(digitToSegments(digit));
    }
  });

  it('garde l’espace éteint et le tiret sur le segment central', () => {
    expect(CHAR_TO_SEGMENTS[' ']).toBe(0x00);
    expect(CHAR_TO_SEGMENTS['-']).toBe(0x01);
    expect(CHAR_TO_SEGMENTS['.']).toBe(0x80);
  });
});

describe('texte de version', () => {
  it('est rembourré pour entrer et sortir de l’écran en douceur', () => {
    expect(VERSION_TEXT.startsWith('         ')).toBe(true);
    expect(VERSION_TEXT.endsWith('         ')).toBe(true);
    expect(VERSION_TEXT).toContain('sliders timer replica by kenny');
  });

  it('n’emploie que des caractères que l’afficheur sait former', () => {
    [...VERSION_TEXT].forEach((char) => {
      expect(CHAR_TO_SEGMENTS[char]).toBeDefined();
    });
  });
});
