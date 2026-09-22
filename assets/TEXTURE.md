# texture-chassis.png

Grain du châssis, extrait d'une photo de la réplique matérielle construite par
Kenny Caldieraro — pas d'une source externe.

Source : `Sliders-timer-replica`, `PICTURES/IMG_0778.jpg`, version pleine
résolution récupérée dans l'historique git (le dépôt ne garde qu'une version
réduite depuis le commit « reduce images »).

Traitement, avec ImageMagick :

```
magick IMG_0778.jpg -crop 96x2000+1600+1000 +repage \
  -colorspace Gray -contrast-stretch 0.5%x0.5% \
  \( +clone -blur 0x100 \) -compose Divide_Src -composite \
  -brightness-contrast -2x-58 -resize 512x1536! \
  -crop 420x1536+30+0 +repage -resize 512x1536! -strip \
  texture-chassis.png
```

La division par une version très floue supprime le dégradé d'éclairage de la
photo et ne garde que le grain de l'impression 3D. L'image est volontairement
désaturée et peu contrastée : elle se pose en surimpression légère sur la
couleur du châssis, elle ne la remplace pas.
