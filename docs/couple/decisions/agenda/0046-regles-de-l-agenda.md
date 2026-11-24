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

# 0046: Règles de l'agenda

## Contexte

L'agenda partagé est la deuxième fonctionnalité du premier lot ([décision 0013](../0013-premier-lot.md)), après les notes. La vision du 2026-11-22 parlait de catégories et d'une couleur par partenaire. Le 2026-11-24, le propriétaire a revu l'idée : un agenda classique, comme ceux de Samsung ou de l'iPhone, « pas besoin de faire des trucs de fou », avec la possibilité de garder un événement pour soi (une date importante que l'autre ne doit pas voir). Une maquette (`Agenda`, clair et sombre) a été validée avant d'écrire ces règles : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

- Un agenda classique : on parcourt les jours, les mois et les années ; on choisit un jour et on y crée un événement.
- Un événement appartient au couple et à son auteur, et porte un titre obligatoire.
- Un jour de début ; un dernier jour facultatif pour un événement de plusieurs jours. Réponse : « Oui, « jusqu'au » facultatif (Recommandé) ».
- Une heure facultative : sans heure, l'événement dure toute la journée. Réponse : « Heure facultative (Recommandé) ».
- Une description facultative, en texte simple.
- Partagé à la création, avec une case « rien que pour moi » : un événement privé n'existe que pour son auteur, comme une note privée.
- Les deux partenaires modifient et suppriment un événement partagé ; seul l'auteur change la visibilité.
- La couleur de l'auteur marque chaque événement : terre cuite pour le partenaire qui a créé le couple, sauge pour l'autre.
- L'écran montre la grille du mois et, en dessous, les événements du jour choisi.
- Ni catégorie, ni lieu, ni répétition, ni notification au premier lot. Réponses : « Non, on les retire (Recommandé) », « Pas au lot 1 (Recommandé) ».

Réponse du propriétaire après la maquette, le 2026-11-24 : « go ».

## Alternatives écartées

- **Catégories obligatoires** (week-end, voyage, soirée…) : un champ de plus à chaque création, retiré par le propriétaire au profit d'un agenda simple.
- **Lieu** : la description suffit.
- **Agenda toujours partagé** : il ne permettrait pas de préparer une surprise.
- **Répétition annuelle** : utile pour les anniversaires, gardée pour plus tard.
- **Liste « À venir » sans grille** : le propriétaire veut un calendrier classique qu'on parcourt.

## Conséquences

- Les règles sont écrites dans [les règles de l'agenda](../../business-rules/agenda/rules.md), qui citent cette décision.
- Le terme « Catégorie » (`CalendarCategory`) sort du glossaire transverse.
- Le choix des composants de l'écran (calendrier et panneau du bas) fera l'objet d'une décision technique avec le code de l'écran.

## Risques

- La limite de 2 000 signes de la description (R6) est une proposition, à confirmer par le propriétaire.
- Sans prénom dans l'app, l'auteur s'affiche « Moi » ou « Mon âme sœur ».
