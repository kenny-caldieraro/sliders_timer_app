# Fiches magasin

Textes prêts à coller. Les limites de caractères sont indiquées et vérifiées
par `scripts/verifie-fiches.py`.

Deux principes ont guidé la rédaction :

1. **Ne rien promettre que l'application ne fasse pas.** Le retrait de 2024
   portait sur la politique des fonctionnalités défectueuses ; une fiche qui
   annonce une fonction absente relève de la même politique.
2. **Dire clairement que c'est un hommage de fan.** *Sliders* appartient à ses
   ayants droit. La fiche ne doit ni utiliser leur marque comme si elle était
   la nôtre, ni laisser croire à un produit officiel.

---

## Google Play

### Titre — 30 caractères maximum

```
Sliders Timer
```

### Description courte — 80 caractères maximum

```
Réplique du minuteur de Sliders : compte à rebours, animations et vortex.
```

### Description complète — 4 000 caractères maximum

```
Sliders Timer est une réplique du minuteur de la série Sliders, reproduit
jusque dans sa logique d'affichage.

L'application n'imite pas l'objet de loin. Elle simule les deux matrices de
LED qui pilotent la façade d'origine, et rejoue les séquences d'animation
image par image, avec leurs fréquences et leurs durées d'origine.


CE QUE VOUS POUVEZ FAIRE

• Régler un compte à rebours, de la seconde au jour, jusqu'à 999 jours
• Lancer le saut et regarder le vortex s'ouvrir
• Forcer un saut anticipé, qui relance le décompte sur une durée tirée au sort
• Basculer en mode burnout : quatre-vingt-dix secondes de sursis, avec ses
  cinq paliers sonores et ses témoins qui passent au fixe l'un après l'autre
• Rattraper le coup à la toute dernière seconde — ou laisser le minuteur mourir
• Tourner la molette pour régler l'arc lumineux
• Être prévenu quand le décompte atteint zéro, même application fermée


CE QUI VIENT DE L'OBJET

Les animations, les cadences de clignotement et les motifs sonores sont repris
du programme d'une réplique matérielle construite autour d'un Arduino. Les
témoins ne clignotent pas au hasard : leurs quatre périodes sont celles de
l'objet, et c'est leur décalage qui lui donne son rythme.

La séquence d'allumage, les huit écrans de brouillage, l'effet de balayage,
l'ouverture du vortex et le tracé de fin de burnout sont tous à leur place.


SOBRIÉTÉ

L'application ne collecte aucune donnée, ne contient aucune publicité, ne
propose aucun achat, et fonctionne entièrement hors ligne. Elle ne demande
que l'autorisation d'afficher une notification, et seulement au moment où
vous lancez votre premier décompte.


HOMMAGE DE FAN

Ce projet est un hommage sans affiliation ni licence officielle. Sliders est
une marque de ses ayants droit. Aucun lien avec les producteurs ou les
diffuseurs de la série.
```

---

## App Store

### Nom — 30 caractères maximum

```
Sliders Timer
```

### Sous-titre — 30 caractères maximum

```
Réplique du minuteur
```

### Texte promotionnel — 170 caractères maximum

```
Les animations, les cadences de LED et les paliers sonores sont repris du
programme d'une réplique matérielle. Rien n'est approximé.
```

### Description — 4 000 caractères maximum

```
Sliders Timer est une réplique du minuteur de la série Sliders, reproduit
jusque dans sa logique d'affichage.

L'application n'imite pas l'objet de loin. Elle simule les deux matrices de
LED qui pilotent la façade d'origine, et rejoue les séquences d'animation
image par image, avec leurs fréquences et leurs durées d'origine.


CE QUE VOUS POUVEZ FAIRE

• Régler un compte à rebours, de la seconde au jour, jusqu'à 999 jours
• Lancer le saut et regarder le vortex s'ouvrir
• Forcer un saut anticipé, qui relance le décompte sur une durée tirée au sort
• Basculer en mode burnout : quatre-vingt-dix secondes de sursis, avec ses
  cinq paliers sonores et ses témoins qui passent au fixe l'un après l'autre
• Rattraper le coup à la toute dernière seconde — ou laisser le minuteur mourir
• Tourner la molette pour régler l'arc lumineux
• Être prévenu quand le décompte atteint zéro, même application fermée


CE QUI VIENT DE L'OBJET

Les animations, les cadences de clignotement et les motifs sonores sont repris
du programme d'une réplique matérielle construite autour d'un Arduino. Les
témoins ne clignotent pas au hasard : leurs quatre périodes sont celles de
l'objet, et c'est leur décalage qui lui donne son rythme.

La séquence d'allumage, les huit écrans de brouillage, l'effet de balayage,
l'ouverture du vortex et le tracé de fin de burnout sont tous à leur place.


SOBRIÉTÉ

Aucune donnée collectée, aucune publicité, aucun achat, aucun compte. Tout
fonctionne hors ligne.


HOMMAGE DE FAN

Ce projet est un hommage sans affiliation ni licence officielle. Sliders est
une marque de ses ayants droit.
```

### Mots-clés — 100 caractères maximum, séparés par des virgules, sans espaces

```
sliders,minuteur,timer,vortex,replique,compte a rebours,retro,serie,prop,led,arduino,fan
```

### Nouveautés de cette version

```
Réécriture complète de l'application.

• Les animations sont désormais reprises du programme d'une réplique
  matérielle, image par image
• Mode burnout et ouverture du vortex
• Notification à la fin du décompte
• Le décompte ne dérive plus et survit au passage en arrière-plan
• Notice d'utilisation intégrée
• Interface redessinée, nette à toutes les définitions
```

---

## Identifiants des fiches existantes

À ne jamais changer : en changer un créerait une nouvelle application au lieu
de mettre à jour celle qui est publiée. Ils diffèrent d'un magasin à l'autre,
ce qui est normal — chaque magasin a son propre espace de noms.

| Magasin | Identifiant | Version |
|---|---|---|
| Google Play | `com.sliderstimer` | 2.0.0, versionCode 5 (dernier publié : 4) |
| App Store | `com.webplayground.slidersreplica` | 2.0.0, build 5 (dernier publié : 1.1) |

## Visuels fournis

| Fichier | Format | Pour |
|---|---|---|
| `icones/app-store-1024.png` | 1024 × 1024, sans alpha | Icône App Store. Apple refuse la transparence et les coins arrondis. |
| `icones/google-play-512.png` | 512 × 512 | Icône Play. |
| `banniere/google-play-1024x500.png` | 1024 × 500, sans alpha | Image mise en avant de la fiche Play. Play la recadre selon les emplacements : rien d'essentiel n'est placé près des bords. |
| `app-store-6.9/` | 1320 × 2868 | Gabarit 6,9 pouces. |
| `app-store-6.5/` | 1242 × 2688 | Gabarit 6,5 pouces. **C'est celui qu'attend la fiche existante** : App Store Connect refuse le 6,9 dans un emplacement configuré en 6,5. |
| `google-play-phone/` | 1434 × 2868 | Les mêmes, complétées en noir jusqu'à 2:1. |

Les trois jeux sont composés à la même échelle relative, pas redimensionnés
les uns depuis les autres : le texte reste net à chaque définition.

## À remplir vous-même

Ces champs dépendent de votre compte et ne peuvent pas être rédigés d'avance.

| Champ | Valeur |
|---|---|
| Catégorie Play | Divertissement |
| Catégorie App Store | Divertissement |
| Classification | Tout public. Aucun contenu sensible, aucune interaction entre utilisateurs, aucun achat. |
| Politique de confidentialité | **Obligatoire sur les deux magasins, même sans collecte.** Une page suffit : « cette application ne collecte, ne transmet et ne stocke aucune donnée personnelle ». |
| Sûreté des données (Play) | Aucune donnée collectée, aucune donnée partagée. |
| Confidentialité (App Store) | « Données non collectées ». |
| URL d'assistance | Obligatoire sur l'App Store. Le dépôt GitHub fait l'affaire. |
| Adresse de contact | Obligatoire sur Play. |


## Risque assumé

`assets/vortex.mp4` est un extrait de la série. La fiche reste donc exposée à
un retrait pour propriété intellectuelle, quelle que soit la prudence des
textes ci-dessus. Décision prise de le conserver.

Les textes limitent ce qui peut l'être : ils ne revendiquent aucune
affiliation, n'emploient la marque que pour désigner l'objet reproduit, et
annoncent explicitement un hommage de fan. Les visuels sont originaux.
