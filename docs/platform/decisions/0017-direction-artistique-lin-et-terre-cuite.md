---
nature: produit
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0017: Direction artistique « Lin et terre cuite »

## Contexte

Depuis le 2026-11-23, la PWA porte une palette provisoire (`packages/design-system/src/styles/globals.css`), en attendant l'identité visuelle du couple (décision D44 du propriétaire). Les notes sont en production depuis le 2026-11-24 : c'est le moment de fixer le style avant l'agenda et les messages, pour ne pas repasser chaque nouvel écran.

Trois directions ont été préparées à partir d'apps du même esprit (apps de couple, apps de notes calmes) : A « Lin et terre cuite », B « Nid douillet » (rose poudré, lavande, formes en pilule), C « Lampe de chevet » (sombre d'abord, ambre et prune). Chacune a été montrée sur une planche, avec la liste des notes et l'éditeur, en clair et en sombre, aux libellés réels de l'app : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP. Les valeurs ci-dessous font foi ; la planche n'est qu'une illustration.

## Décision

La PWA prend la direction A « Lin et terre cuite », en clair et en sombre, selon le réglage du téléphone.

**Couleurs.** Jamais de blanc ni de noir purs.

| Rôle | Clair | Sombre |
|---|---|---|
| Fond de page | `#FBF6EE` | `#1C1714` |
| Surface (carte, champ, éditeur) | `#FFFDF8` | `#27201C` |
| Texte | `#2B211B` | `#F3EADF` |
| Texte secondaire | `#6E5F55` | `#B9AA9C` |
| Accent terre cuite (bouton principal, lien, case cochée) | `#A65A33` | `#D98A5F` |
| Texte sur l'accent | `#FFFDF8` | `#1C1714` |
| Étiquette sauge (fond / texte) | `#E6EDE3` / `#3F5A3C` | `#2F3A2E` / `#B9D0B4` |
| Suppression | `#A3362B` | `#EE8B7B` |
| Bordure de champ, case vide | `#8C7A6D` | `#8A7B6F` |
| Bordure décorative (carte) | `#EADFD1` | `#3A302A` |

**Contrastes (WCAG 2.2, niveau AA).** Un texte atteint 4,5:1 au moins, une bordure de champ ou une case 3:1 au moins, sur le fond comme sur la surface. Valeurs les plus basses : texte 14,6 (clair) et 13,5 (sombre), texte secondaire 5,7 et 7,1, accent 4,7 et 5,9, texte sur l'accent 5,0 et 6,6, étiquette 6,4 et 7,2, suppression 6,3 et 6,6, bordure de champ 3,8 et 3,9. La bordure décorative n'atteint pas 3:1 : elle ne sert jamais seule à délimiter un élément qu'on touche.

**Polices.** Fraunces pour les titres (axe `SOFT` à 100, poids 560 environ), Inter pour le texte. Elles sont servies par la PWA elle-même (`next/font`, téléchargées au build) : le téléphone ne demande rien à Google.

**Formes.** Rayon de 20 px pour les cartes et l'éditeur, 12 px pour les champs, boutons et la barre d'outils, 8 px pour les étiquettes. Toute cible tactile mesure 44 px au moins.

**Mise en page.** Celle de la planche, approuvée avec la direction :
- « Nos notes » : titre en Fraunces, formulaire de création en haut (champ et bouton « Créer la note » sur une ligne), puis une carte par note avec son titre, l'étiquette « Partagée » (sauge) ou « Privée » (contour), à qui elle appartient (« Ma note » ou « Note de mon âme sœur ») et la date, et les actions « Partager » ou « Rendre privée » et « Supprimer » sur les seules notes de la partenaire connectée.
- Note : lien de retour « Nos notes », titre et bouton « Renommer », ligne d'étiquette et de date, barre de mise en forme en boutons de 44 px, contenu dans une carte.

Réponse du propriétaire, le 2026-11-24, après la planche : « Lint et terre cuit sombre et clair j'adore et pareil pour l'affichage ce que tu as fait j'adore ».

## Alternatives écartées

- **B « Nid douillet »** (Quicksand et Nunito, rose poudré, sauge et lavande, formes en pilule) : montrée sur la planche, non retenue.
- **C « Lampe de chevet »** (Instrument Serif et Figtree, sombre d'abord, ambre et prune) : montrée sur la planche, non retenue.
- **Palette provisoire** : posée pour démarrer la phase 3, sans identité.
- **Couleurs de la recherche telles quelles** : la terre cuite `#B4643C` ne donnait que 4,0:1 sur le fond et la sauge `#7E9A7A` 2,9:1 en texte. L'accent est assombri en `#A65A33` et la sauge ne sert plus que de fond d'étiquette.
- **Polices chargées depuis Google Fonts à l'exécution** : une requête vers un tiers à chaque ouverture, et des titres sans leur police hors ligne.

## Conséquences

- Les tokens de `packages/design-system/src/styles/globals.css` remplacent la palette provisoire, et le piège « Palette provisoire » de `packages/design-system/CLAUDE.md` disparaît.
- `docs/design/` naît avec la page des tokens, que `docs/index.md` liste.
- Les écrans (connexion, mise en couple, liste des notes, note) sont repassés sur cette mise en page ; l'agenda et les messages naissent dans ce style.

## Risques

- L'accent et la suppression sont deux tons chauds proches (1,3:1 entre eux) : un bouton de suppression se reconnaît à son libellé et à sa confirmation, jamais à sa seule couleur.
- Le sombre n'a été vu que sur la planche : à juger sur les deux téléphones, surtout l'écran OLED du Samsung.
- Fraunces en police variable alourdit le premier chargement ; `next/font` ne garde que l'alphabet latin.
