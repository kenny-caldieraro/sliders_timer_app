import subprocess, os, sys

SHOTS = '/private/tmp/claude-501/-Users-kenny-Projects-Perso-sliders-timer-app/779ce12e-9e89-4d28-9353-13c672383f1f/scratchpad/shots'
OUT = '/Users/kenny/Projects/Perso/sliders_timer_app/store-assets/app-store-6.9'
TMP = '/tmp/_compose'

W, H = 1320, 2868          # format App Store 6,9 pouces
PHONE_W = 1010
PHONE_TOP = 520
RADIUS = 76

HEADLINE = 'Avenir-Next-Condensed-Heavy'
SUBLINE = 'Avenir-Next-Demi-Bold'

SCREENS = [
    ('s3.png', 'REPLIQUE', 'RÉPLIQUE FIDÈLE',       'Le minuteur de Sliders, animation par animation'),
    ('s5.png', 'REGLAGE',  'DES SECONDES AUX JOURS', 'Réglez le compte à rebours jusqu’à 999 jours'),
    ('s1.png', 'TEMOINS',  'TÉMOINS ET BARGRAPHES',  'Les cadences relevées sur le firmware d’origine'),
    ('s7.png', 'BURNOUT',  'MODE BURNOUT',           'Forcez le saut : quatre-vingt-dix secondes de sursis'),
]

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('magick a échoué : ' + (r.stderr or r.stdout)[:500])

def size_of(path):
    out = subprocess.check_output(['magick', 'identify', '-format', '%w %h', path]).decode()
    w, h = out.split()
    return int(w), int(h)

def compose(shot, title, sub, dest):
    os.makedirs(TMP, exist_ok=True)

    # Fond : noir, avec une lueur rouge en haut qui rappelle l'arc du minuteur.
    run(['magick', '-size', f'{W}x{H}', 'xc:#050506',
         '(', '-size', f'{W}x{W}', 'radial-gradient:#6a0f0f-#050506',
              '-resize', f'{W}x{int(W*1.2)}!', ')',
         '-gravity', 'north', '-compose', 'screen', '-composite',
         f'{TMP}/bg.png'])

    # L'appareil : capture redimensionnée, puis coins arrondis par un masque
    # dédié. Extraire puis retoucher le canal alpha de l'image elle-même
    # effaçait son contenu.
    run(['magick', f'{SHOTS}/{shot}', '-resize', f'{PHONE_W}x', f'{TMP}/shot.png'])
    sw, sh = size_of(f'{TMP}/shot.png')
    run(['magick', '-size', f'{sw}x{sh}', 'xc:black', '-fill', 'white',
         '-draw', f'roundrectangle 0,0,{sw-1},{sh-1},{RADIUS},{RADIUS}',
         f'{TMP}/mask.png'])
    run(['magick', f'{TMP}/shot.png', f'{TMP}/mask.png',
         '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', f'{TMP}/phone.png'])

    # Liseré du boîtier, tracé par-dessus.
    run(['magick', f'{TMP}/phone.png', '-fill', 'none',
         '-stroke', '#6e6e74', '-strokewidth', '5',
         '-draw', f'roundrectangle 2,2,{sw-3},{sh-3},{RADIUS},{RADIUS}',
         f'{TMP}/phone.png'])

    run(['magick', f'{TMP}/bg.png',
         f'{TMP}/phone.png', '-gravity', 'north', '-geometry', f'+0+{PHONE_TOP}',
         '-compose', 'over', '-composite',
         '-gravity', 'north',
         '-font', HEADLINE, '-pointsize', '104', '-fill', '#f4f4f6',
         '-annotate', '+0+196', title,
         '-font', SUBLINE, '-pointsize', '44', '-fill', '#9c9ca4',
         '-annotate', '+0+338', sub,
         dest])

for i, (shot, slug, title, sub) in enumerate(SCREENS, 1):
    dest = f'{OUT}/{i:02d}-{slug.lower()}.png'
    compose(shot, title, sub, dest)
    print('composé :', os.path.basename(dest))
