#!/usr/bin/env python3
"""Compose les visuels de fiche magasin à partir de captures du simulateur.

Les captures doivent venir d'un build **Release** : en débogage, le bouton du
menu de développement se retrouve sur l'image.

    npx expo run:ios --configuration Release --device "iPhone 17 Pro Max"
    xcrun simctl io booted screenshot capture.png
"""
import subprocess, os, sys

SHOTS = ('/private/tmp/claude-501/-Users-kenny-Projects-Perso-sliders-timer-app/'
         '779ce12e-9e89-4d28-9353-13c672383f1f/scratchpad/shots')
RACINE = 'store-assets'
TMP = '/tmp/_compose'

HEADLINE = 'Avenir-Next-Condensed-Heavy'
SUBLINE = 'Avenir-Next-Demi-Bold'

# Gabarits demandés par chaque magasin. L'App Store accepte le 6,9 pouces
# partout, mais une fiche déjà configurée en 6,5 réclame ses dimensions
# propres ; on fournit donc les deux.
#
# Play refuse une image dont la plus grande dimension dépasse deux fois la
# plus petite. Les formats natifs sont à 2,17 : le jeu Play est donc élargi
# en noir jusqu'à 2:1 exactement, plutôt que rogné.
GABARITS = [
    ('app-store-6.9', 1320, 2868, None),
    ('app-store-6.5', 1242, 2688, None),
    ('google-play-phone', 1320, 2868, 2.0),
]

SCREENS = [
    ('s3.png', 'replique', 'RÉPLIQUE FIDÈLE',       'Le minuteur de Sliders, animation par animation'),
    ('s5.png', 'reglage',  'DES SECONDES AUX JOURS', 'Réglez le compte à rebours jusqu’à 999 jours'),
    ('s1.png', 'temoins',  'TÉMOINS ET BARGRAPHES',  'Les cadences relevées sur le firmware d’origine'),
    ('s7.png', 'burnout',  'MODE BURNOUT',           'Forcez le saut : quatre-vingt-dix secondes de sursis'),
]


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('magick a échoué : ' + (r.stderr or r.stdout)[:400])


def taille(chemin):
    w, h = subprocess.check_output(
        ['magick', 'identify', '-format', '%w %h', chemin]).decode().split()
    return int(w), int(h)


def compose(shot, titre, sous_titre, dest, W, H):
    """Toutes les mesures sont relatives au gabarit : le rendu est identique
    quelle que soit la définition demandée."""
    os.makedirs(TMP, exist_ok=True)
    phone_w = round(W * 0.765)
    phone_top = round(H * 0.181)
    rayon = round(W * 0.058)

    run(['magick', '-size', f'{W}x{H}', 'xc:#050506',
         '(', '-size', f'{W}x{W}', 'radial-gradient:#6a0f0f-#050506',
              '-resize', f'{W}x{round(W * 1.2)}!', ')',
         '-gravity', 'north', '-compose', 'screen', '-composite',
         f'{TMP}/bg.png'])

    # Coins arrondis par un masque dédié : retoucher le canal alpha de
    # l'image elle-même en efface le contenu.
    run(['magick', f'{SHOTS}/{shot}', '-resize', f'{phone_w}x', f'{TMP}/shot.png'])
    sw, sh = taille(f'{TMP}/shot.png')
    run(['magick', '-size', f'{sw}x{sh}', 'xc:black', '-fill', 'white',
         '-draw', f'roundrectangle 0,0,{sw-1},{sh-1},{rayon},{rayon}', f'{TMP}/mask.png'])
    run(['magick', f'{TMP}/shot.png', f'{TMP}/mask.png',
         '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', f'{TMP}/phone.png'])
    run(['magick', f'{TMP}/phone.png', '-fill', 'none',
         '-stroke', '#6e6e74', '-strokewidth', str(max(round(W * 0.004), 3)),
         '-draw', f'roundrectangle 2,2,{sw-3},{sh-3},{rayon},{rayon}', f'{TMP}/phone.png'])

    run(['magick', f'{TMP}/bg.png',
         f'{TMP}/phone.png', '-gravity', 'north', '-geometry', f'+0+{phone_top}',
         '-compose', 'over', '-composite',
         '-gravity', 'north',
         '-font', HEADLINE, '-pointsize', str(round(W * 0.0788)), '-fill', '#f4f4f6',
         '-annotate', f'+0+{round(H * 0.0683)}', titre,
         '-font', SUBLINE, '-pointsize', str(round(W * 0.0333)), '-fill', '#9c9ca4',
         '-annotate', f'+0+{round(H * 0.1178)}', sous_titre,
         dest])


for dossier, W, H, plafond in GABARITS:
    sortie = os.path.join(RACINE, dossier)
    os.makedirs(sortie, exist_ok=True)
    for i, (shot, slug, titre, sous_titre) in enumerate(SCREENS, 1):
        dest = os.path.join(sortie, f'{i:02d}-{slug}.png')
        compose(shot, titre, sous_titre, dest, W, H)
        if plafond:
            largeur_min = round(H / plafond)
            if largeur_min > W:
                run(['magick', dest, '-background', 'black', '-gravity', 'center',
                     '-extent', f'{largeur_min}x{H}', dest])
    print(f'{dossier:<22} {len(SCREENS)} visuels')
