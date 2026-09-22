#!/usr/bin/env python3
"""Bannière de la fiche Google Play : 1024 x 500, sans canal alpha.

Play recadre cette image selon les emplacements, parfois agressivement. Le
motif et le texte restent donc loin des bords, et rien d'essentiel ne se
trouve dans les cent premiers pixels de chaque côté.
"""
import subprocess, sys, os

W, H = 1024, 500
TMP = '/tmp/_banniere'
DEST = 'store-assets/banniere/google-play-1024x500.png'

HEADLINE = 'Avenir-Next-Condensed-Heavy'
SUBLINE = 'Avenir-Next-Demi-Bold'


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('magick a échoué : ' + (r.stderr or r.stdout)[:400])


os.makedirs(TMP, exist_ok=True)

# Fond : noir, lueur rouge décalée à gauche, là où se pose le motif.
run(['magick', '-size', f'{W}x{H}', 'xc:#050506',
     '(', '-size', '560x560', 'radial-gradient:#7a1010-#050506', ')',
     '-gravity', 'west', '-geometry', '+30+0',
     '-compose', 'screen', '-composite', f'{TMP}/bg.png'])

# Le motif de l'icône, agrandi : l'arc et les deux points du séparateur.
run(['rsvg-convert', '-w', '760', '-h', '760', 'assets/icon.svg',
     '-o', f'{TMP}/mark.png'])
run(['magick', f'{TMP}/mark.png', '-resize', '356x356',
     '-fuzz', '12%', '-transparent', '#050506', f'{TMP}/mark.png'])

run(['magick', f'{TMP}/bg.png',
     f'{TMP}/mark.png', '-gravity', 'west', '-geometry', '+56+0',
     '-compose', 'over', '-composite',
     '-gravity', 'west',
     '-font', HEADLINE, '-pointsize', '74', '-fill', '#f4f4f6',
     '-annotate', '+448-42', 'SLIDERS TIMER',
     '-font', SUBLINE, '-pointsize', '29', '-fill', '#a8a8b0',
     '-annotate', '+452+18', 'Réplique du minuteur de la série',
     '-font', SUBLINE, '-pointsize', '25', '-fill', '#ff2d2d',
     '-annotate', '+454+66', 'Animations portées du firmware',
     '-alpha', 'remove', '-alpha', 'off', '-strip', DEST])

out = subprocess.check_output(
    ['magick', 'identify', '-format', '%wx%h alpha:%A %b', DEST]).decode()
print('bannière :', out)
