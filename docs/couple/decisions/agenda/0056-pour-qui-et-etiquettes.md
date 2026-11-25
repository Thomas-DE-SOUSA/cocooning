---
nature: produit
status: acceptée
date: 2026-11-25
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-25
validated-on: 2026-11-25
supersedes:
superseded-by:
premortem:
---

# 0056: Pour qui est un événement, et des étiquettes de couleur

## Contexte

La [décision 0046](0046-regles-de-l-agenda.md) a fait un agenda simple : un événement partagé ou « rien que pour moi », marqué par la couleur de son auteur. Le 2026-11-25, le propriétaire a demandé de dire si un événement partagé concerne les deux ou seulement l'un (« je vais dîner chez ma mère mais c'est que moi »). Le même jour, des vocaux du couple ont demandé de choisir « moi seul, avec mon compagnon, Pauline ou Thomas », et des couleurs choisies soi-même pour voir d'un coup d'œil comment l'agenda se remplit (« quand je vais prendre un verre […] je sélectionne la couleur verte. Quand c'est une soirée, je mets du rose »). La maquette `Agenda, pour qui et étiquettes` a été validée avant ces règles : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

- Chaque événement dit **pour qui** il est : « Moi », « Toi » ou « Nous deux ». Le libellé dépend de qui regarde : un événement créé « pour Toi » s'affiche « Moi » chez l'autre. Pas de prénom. Réponse : « Moi / Toi / Nous deux (Recommandé) ».
- « Rien que pour moi » reste, et n'est possible qu'avec « Moi ».
- La **couleur** d'un événement est celle de son **étiquette** ; « pour qui » s'affiche en pastille. Réponse : « Couleur = étiquette (Recommandé) ». La couleur de l'auteur disparaît.
- Les étiquettes sont **communes au couple** : un nom et une couleur parmi huit de la palette de l'app. Les deux les créent, les renomment, les recolorent et les suppriment. Réponse : « Communes au couple (Recommandé) ».
- Une étiquette est facultative sur un événement. Supprimer une étiquette laisse ses événements, sans étiquette.
- Les événements existants deviennent « Nous deux » s'ils sont partagés, « Moi » s'ils sont privés, sans étiquette.
- Les notifications ne changent pas (R10).

Réponse du propriétaire après la maquette, le 2026-11-25 : « go ».

## Alternatives écartées

- **Couleur = pour qui** : trois couleurs fixes ne disent rien du type de sortie, que le couple veut voir.
- **Étiquettes à chacun** : deux listes et deux couleurs pour le même verre ; le couple partage un agenda.
- **Prénoms** : l'app ne les connaît pas ; « Moi / Toi » suffit à deux.
- **Couleur libre (sélecteur)** : des couleurs illisibles en mode sombre ; huit teintes réglées pour les deux thèmes suffisent.

## Conséquences

- Règles R11 à R14 dans [les règles de l'agenda](../../business-rules/agenda/rules.md) ; termes « Pour qui », « Étiquette » et « Couleur d'étiquette » au [glossaire de l'agenda](../../business-rules/agenda/glossary.md).
- Lots : serveur, client, écran, puis release.

## Risques

- Huit couleurs et 20 étiquettes au plus par couple, 30 signes par nom : propositions de Claude, à confirmer à l'usage.
