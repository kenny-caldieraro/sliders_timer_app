# Visuels de fiche magasin

Générés par `scripts/compose-store-assets.py` à partir de captures du
simulateur, sur un build **Release** — en debug, le bouton du menu de
développement apparaît sur les captures.

## Formats

| Dossier | Dimensions | Pour |
|---|---|---|
| `app-store-6.9/` | 1320 × 2868 | App Store, gabarit 6,9 pouces. C'est la définition native de l'iPhone 17 Pro Max, acceptée telle quelle. |
| `google-play-phone/` | 1434 × 2868 | Google Play, téléphone. |

Play refuse une image dont la plus grande dimension dépasse **deux fois** la
plus petite. Le format natif est à 2,17 : les visuels Play sont donc complétés
en noir sur les côtés pour tomber exactement à 2:1, plutôt que rognés — le
fond de l'application étant déjà noir, le remplissage ne se voit pas.

## Régénérer

```
python3 scripts/compose-store-assets.py
```

Le script attend des captures dans le dossier indiqué en tête de fichier.
Pour en reprendre :

```
npx expo run:ios --configuration Release --device "iPhone 17 Pro Max"
xcrun simctl io booted screenshot capture.png
```

## Tablettes

Non fournies : l'application est déclarée `supportsTablet: false`, et sa
façade est calée sur un format portrait allongé qui ne tient pas en 4:3.
