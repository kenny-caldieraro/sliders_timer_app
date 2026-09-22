import re, io, sys

SRC = '/Users/kenny/Projects/Perso/Sliders-timer-replica/CODE/sliders_timer_main/sliders_timer_main.ino'
src = io.open(SRC, encoding='utf-8', errors='replace').read()

def block(name):
    """Recupere le corps { ... } de la table `name`."""
    i = src.index(name)
    start = src.index('{', i)
    depth, j = 0, start
    while True:
        if src[j] == '{': depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    return src[start+1:j]

def rows(body):
    """Decoupe en entrees de premier niveau."""
    out, depth, cur = [], 0, ''
    for ch in body:
        if ch == '{':
            depth += 1
            if depth == 1: cur = ''; continue
        elif ch == '}':
            depth -= 1
            if depth == 0: out.append(cur); continue
        if depth >= 1: cur += ch
    return out

hexes = lambda s: [int(x, 16) for x in re.findall(r'0x([0-9A-Fa-f]{1,2})\b', s)]
fmt   = lambda a: '[' + ', '.join('0x%02X' % v for v in a) + ']'

def anim_frames(name):
    """r0[6], r1[5], tone_freq, tone_dur, delay_ms"""
    out = []
    for entry in rows(block(name)):
        groups = re.findall(r'\{([^}]*)\}', entry)
        r0, r1 = hexes(groups[0]), hexes(groups[1])
        tail = entry[entry.rindex('}')+1:]
        nums = [int(n) for n in re.findall(r'(\d+)', tail)]
        out.append((r0, r1, nums))
    return out

def genser_frames():
    """r0[6], r1[5], hold_ms, clear_pause_ms"""
    return anim_frames('GENSER_FRAMES')

def r0_only(name):
    return [hexes(e) for e in rows(block(name))]

def u64(name):
    body = block(name)
    return [int(x, 16) for x in re.findall(r'0x([0-9A-Fa-f]{16})', body)]

L = []
w = L.append

w('/**')
w(" * Tables d'animation portées telles quelles depuis le firmware Arduino de la")
w(' * réplique matérielle :')
w(' *   Sliders-timer-replica/CODE/sliders_timer_main/sliders_timer_main.ino')
w(' *')
w(' * Ce fichier est GÉNÉRÉ — ne pas le modifier à la main. Pour le régénérer :')
w(' *   node scripts/port-arduino-frames.mjs')
w(' *')
w(' * Encodage : un octet par afficheur sept segments, format MAX7219.')
w(' *   bit 7 = point décimal, bits 6→0 = segments A B C D E F G.')
w(' */')
w('')
w('/** Une image d\'animation : l\'état des deux matrices, un son, une durée. */')
w('export type AnimFrame = {')
w('  /** Matrice 0, lignes 0-5 : les six afficheurs HH MM SS. */')
w('  r0: readonly number[];')
w('  /** Matrice 1, lignes 0-4 : les trois afficheurs de jours + les deux bargraphes. */')
w('  r1: readonly number[];')
w('  /** Fréquence du bip en Hz ; 0 = silence. */')
w('  toneFreq: number;')
w('  /** Durée du bip en ms. */')
w('  toneDur: number;')
w('  /** Temps d\'affichage de l\'image en ms. */')
w('  delayMs: number;')
w('};')
w('')
w("/** Une image de la séquence GENSER : affichée, puis effacée. */")
w('export type GenserFrame = {')
w('  r0: readonly number[];')
w('  r1: readonly number[];')
w('  /** Durée d\'affichage avec le bip, en ms. */')
w('  holdMs: number;')
w('  /** Temps d\'écran noir après l\'effacement, en ms. */')
w('  clearPauseMs: number;')
w('};')
w('')

# --- GENSER ---
w("/** Amorçage : huit écrans GENSER / CALURI / KENNY entrecoupés de brouillage. */")
w('export const GENSER_FRAMES: readonly GenserFrame[] = [')
for r0, r1, nums in genser_frames():
    w('  { r0: %s, r1: %s, holdMs: %d, clearPauseMs: %d },' % (fmt(r0), fmt(r1), nums[0], nums[1]))
w('];')
w('')
w('/** Fréquence et durée du bip de chaque image GENSER. */')
w('export const GENSER_TONE = { freq: 5500, durMs: 50 } as const;')
w('')

# --- DISPLAY FADE ---
w("/** Fondu de sortie des afficheurs, en neuf images. */")
w('export const DISPLAY_FADE_FRAMES: readonly AnimFrame[] = [')
for r0, r1, nums in anim_frames('DISPLAY_FADE_FRAMES'):
    w('  { r0: %s, r1: %s, toneFreq: %d, toneDur: %d, delayMs: %d },' % (fmt(r0), fmt(r1), nums[0], nums[1], nums[2]))
w('];')
w('')

# --- DISPLAY WRAP ---
w('/** Effet « wrap » : balayage de segments, tons descendant de 5500 à 2500 Hz. */')
w('export const DISPLAY_WRAP_FRAMES: readonly AnimFrame[] = [')
for r0, r1, nums in anim_frames('DISPLAY_WRAP_FRAMES'):
    w('  { r0: %s, r1: %s, toneFreq: %d, toneDur: %d, delayMs: %d },' % (fmt(r0), fmt(r1), nums[0], nums[1], nums[2]))
w('];')
w('')

# --- WRAP BURNOUT ---
burn = r0_only('WRAP_BURNOUT_R0_FRAMES')
w('/** Tracé progressif de fin de burnout : trente-deux images, 50 ms chacune. */')
w('export const WRAP_BURNOUT_FRAMES: readonly (readonly number[])[] = [')
for r in burn:
    w('  %s,' % fmt(r))
w('];')
w('')
w('/** État figé de la matrice 1 pendant wrapBurnout. */')
w('export const WRAP_BURNOUT_M1 = { r0: 0x6D, r1: 0xFB, r2: 0x3B, r3: 0x00, r4: 0x00, r6: 0x78 } as const;')
w('export const WRAP_BURNOUT_FRAME_MS = 50;')
w('')

# --- BARGRAPHES ---
names = [('IMAGES_POST_FIN','BARGRAPH_POST_END', 15, "Bargraphes juste après la fin du décompte."),
         ('IMAGES_NORMAL','BARGRAPH_NORMAL', 20, "Bargraphes en fonctionnement normal."),
         ('IMAGES_FIN','BARGRAPH_END', 15, "Bargraphes des trente dernières secondes."),
         ('IMAGES_OFF','BARGRAPH_OFF', 0, "Bargraphes éteints.")]
w('/**')
w(' * Images des deux bargraphes.')
w(' *')
w(" * Le firmware stocke chaque image sur 64 bits mais n'en affiche que les octets")
w(' * 3 et 4 (`displayImage` boucle sur les lignes 3 et 4 de la matrice 1).')
w(' * Ces deux octets sont extraits ici : un octet par bargraphe, un bit par LED.')
w(' */')
w('export type BargraphFrame = readonly [left: number, right: number];')
w('')
for src_name, ts_name, delay, doc in names:
    vals = u64(src_name)
    w('/** %s */' % doc)
    w('export const %s = {' % ts_name)
    w('  delayMs: %d,' % delay)
    w('  frames: [')
    for v in vals:
        w('    [0x%02X, 0x%02X],' % ((v >> 24) & 0xFF, (v >> 32) & 0xFF))
    w('  ] as readonly BargraphFrame[],')
    w('} as const;')
    w('')

# --- charToSeg ---
seg = re.search(r"byte charToSeg\(char c\) \{(.*?)\n\}", src, re.S).group(1)
pairs = re.findall(r"case '(.)': return (0x[0-9A-Fa-f]+);", seg)
w('/** Table de conversion caractère → octet de segments, reprise du firmware. */')
w('export const CHAR_TO_SEGMENTS: Readonly<Record<string, number>> = {')
for ch, val in pairs:
    key = "' '" if ch == ' ' else ("\"'\"" if ch == "'" else "'%s'" % ch)
    w('  %s: %s,' % (key, val.upper().replace('0X', '0x')))
w('};')
w('')

# --- VERSION TEXT ---
vt = re.search(r'VERSION_TEXT\[\] PROGMEM = "(.*?)";', src).group(1)
w('/** Texte défilant affiché au tout premier allumage. */')
w("export const VERSION_TEXT = %s;" % ('"' + vt + '"'))
w('export const VERSION_SCROLL_MS = 150;')
w('')

io.open('src/animations/frames.ts', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('OK ->', 'src/animations/frames.ts')
print('  GENSER        :', len(genser_frames()), 'images')
print('  DISPLAY_FADE  :', len(anim_frames('DISPLAY_FADE_FRAMES')), 'images')
print('  DISPLAY_WRAP  :', len(anim_frames('DISPLAY_WRAP_FRAMES')), 'images')
print('  WRAP_BURNOUT  :', len(burn), 'images')
for s, t, d, _ in names:
    print('  %-14s:' % t, len(u64(s)), 'images')
print('  charToSeg     :', len(pairs), 'caracteres')
