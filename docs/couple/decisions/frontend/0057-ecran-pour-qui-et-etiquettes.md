---
nature: technique
status: proposée
date: 2026-11-26
deciders: [Thomas De Sousa]
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0057: Couleurs des étiquettes et feuille imbriquée de l'agenda

## Contexte

La [décision 0056](../agenda/0056-pour-qui-et-etiquettes.md) colore un événement par son étiquette, une couleur parmi huit, et la maquette `Agenda, pour qui et étiquettes` montre la création d'une étiquette dans une feuille posée au-dessus de la feuille de l'événement. Il reste trois choix techniques à l'écran : où vivent les huit couleurs, comment la seconde feuille s'empile, et où l'onglet « Nous » trouve les étiquettes à modifier.

## Décision

- **Les huit couleurs sont des tokens du design system**, `--label-sage` à `--label-pebble` et `--label-none` (sans étiquette) dans `packages/design-system/src/styles/globals.css`, clair et sombre, exposés à Tailwind en `bg-label-*` et `border-label-*`. Une clé `CalendarLabelColorEnum` choisit sa classe dans une table du module `agenda` de la PWA, jamais une couleur en dur.

| Couleur | Clair | Sombre | Contraste, surface claire / sombre |
|---|---|---|---|
| Sauge | `#5E7F57` | `#9FC196` | 4,4 / 8,0 |
| Rose | `#C25B7E` | `#E89AB5` | 4,1 / 7,4 |
| Terre cuite | `#A65A33` | `#D98A5F` | 5,0 / 5,9 |
| Ocre | `#B7862B` | `#E0B661` | 3,2 / 8,4 |
| Ardoise | `#4F6F99` | `#93B1DA` | 5,1 / 7,3 |
| Prune | `#7D5491` | `#BFA0D1` | 5,8 / 7,0 |
| Menthe | `#3E8580` | `#82C4BE` | 4,2 / 8,1 |
| Galet | `#7A6E66` | `#B9AA9C` | 4,9 / 7,1 |
| Sans étiquette | `#B5A79B` | `#6E6157` | 2,3 / 2,7 |

  Les huit couleurs servent de barre, de point et de pastille, jamais de texte : elles atteignent 3:1 sur la surface (WCAG 2.2, 1.4.11), sur le fond aussi (3,0 au plus bas, l'ocre clair). Le neutre reste en dessous, voulu discret : la carte écrit « Sans étiquette » à côté.
- **La feuille « Nouvelle étiquette » est une feuille imbriquée** de vaul (`Drawer.NestedRoot`), exportée par le design system en `DrawerNested` avec les réglages de `Drawer` (poignée seule, pas de remontée au clavier). Elle monte au-dessus de la feuille de l'événement, qui garde son formulaire ; une étiquette créée est choisie sur l'événement.
- **La carte « Étiquettes de l'agenda » de l'onglet « Nous » appartient au module `agenda`** (`CalendarLabelsContainer`), comme la carte des notifications appartient à `messaging` : la page lit les étiquettes par `loadCalendarLabels()` et la carte les modifie et les supprime dans une feuille.

## Alternatives écartées

- **Changer le contenu de la feuille de l'événement**, comme les feuilles des notes ([décision 0053](0053-ecran-des-espaces-et-des-dossiers.md)) : la maquette validée montre deux feuilles empilées, et revenir à l'événement après la création demanderait un état de plus.
- **Couleurs en hexadécimal dans le module** : `core.md` règle 8 et le design system les interdisent, et le sombre demande une seconde valeur.
- **Un module `labels` à part** : les étiquettes sont un agrégat du contexte `agenda` ; le module web suit le contexte.

## Conséquences

- `docs/design/tokens.md` liste les couleurs d'étiquette ; `packages/design-system/CLAUDE.md` cite `DrawerNested`.
- `presentAuthorColor` et la couleur de l'auteur disparaissent de la PWA (R1, R13 des [règles de l'agenda](../../business-rules/agenda/rules.md)).

## Risques

- Une feuille imbriquée et le clavier de l'iPhone n'ont été vus qu'en jsdom : à essayer sur les deux téléphones (titre et champ « Nom » visibles au-dessus du clavier, retour à la feuille de l'événement).
- Rose et terre cuite sont proches en clair : l'étiquette se lit à son nom, jamais à sa seule couleur.
