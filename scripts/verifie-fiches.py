#!/usr/bin/env python3
"""Contrôle les limites de caractères des fiches magasin.

Les deux magasins tronquent sans prévenir. Mieux vaut le savoir ici qu'au
moment de coller dans la console.
"""
import io, re, sys

CHEMIN = 'store-assets/FICHES.md'

# Titre de section -> limite de caractères. `None` : pas de limite.
LIMITES = {
    'Titre': 30,
    'Description courte': 80,
    'Description complète': 4000,
    'Nom': 30,
    'Sous-titre': 30,
    'Texte promotionnel': 170,
    'Description': 4000,
    'Mots-clés': 100,
    'Nouveautés de cette version': 4000,
}

texte = io.open(CHEMIN, encoding='utf-8').read()

# Chaque champ est un titre de niveau 3 suivi d'un bloc de code.
blocs = re.findall(r'^### ([^\n—]+?)(?:\s*—[^\n]*)?\n+```\n(.*?)\n```', texte,
                   re.S | re.M)

erreurs = 0
for titre, contenu in blocs:
    titre = titre.strip()
    limite = LIMITES.get(titre)
    n = len(contenu)
    if limite is None:
        print(f'  {titre:<32} {n:>5} caractères')
        continue
    marge = limite - n
    etat = 'OK ' if marge >= 0 else 'TROP LONG'
    if marge < 0:
        erreurs += 1
    print(f'  {titre:<32} {n:>5} / {limite:<5} {etat}'
          + (f'  ({marge:+d})' if marge < 0 else ''))

print()
if erreurs:
    print(f'{erreurs} champ(s) au-dessus de la limite.')
    sys.exit(1)
print('Tous les champs tiennent dans les limites.')
