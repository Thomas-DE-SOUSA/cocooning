---
nature: produit
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0039: Règles des notes

## Contexte

Les notes sont la première fonctionnalité du premier lot ([décision 0013](../0013-premier-lot.md)) : riches, personnelles ou partagées, éditées à deux en temps réel ([décision 0016](../0016-edition-des-notes-en-temps-reel.md)), portées par le couple et leur propriétaire ([décision 0018](../0018-portee-par-couple-et-proprietaire.md)). Avant le code, le propriétaire a tranché la visibilité par défaut, les droits sur une note partagée, la place des notes dans la PWA et l'ordre de livraison (questions du plan de l'étape « notes », 2026-11-23).

## Décision

- Une note appartient au couple et à la partenaire qui l'a créée, sa propriétaire.
- Une note est **partagée** à sa création. Réponse : « Partagée (Recommandé) ».
- Une note partagée se lit et se modifie par les deux partenaires, titre et contenu, en même temps.
- Une note privée n'existe que pour sa propriétaire : l'autre reçoit la même réponse que pour une note inexistante (`404`).
- Seule la propriétaire supprime une note ou change sa visibilité. Réponse : « Propriétaire seule (Recommandé) ».
- Les notes demandent un couple formé.
- Une fois le couple formé, l'accueil de la PWA est la liste des notes. Réponse : « La liste des notes (Recommandé) ».
- Les notes sont livrées quand l'édition à deux en direct fonctionne, pas avant. Réponse : « Oui, d'emblée (Recommandé) ».

## Alternatives écartées

- **Note privée par défaut** : il faudrait partager chaque liste commune, alors que les courses et les listes à deux sont le premier usage.
- **Les deux partenaires suppriment une note partagée** : une suppression par erreur ferait disparaître le travail de l'autre.
- **Un menu à l'accueil** : une page de plus à chaque ouverture, pour une seule fonctionnalité aujourd'hui.
- **Livrer d'abord des notes sans temps réel** : le « dernier qui enregistre gagne » perd des modifications à deux (décision 0016).

## Conséquences

- Les règles sont écrites dans [les règles des notes](../../business-rules/notes/rules.md), qui citent cette décision.
- L'architecture du temps réel suit la [décision 0040](0040-edition-a-deux-par-hocuspocus-dans-l-api.md) ; le couple de la requête suit la [décision 0041](../0041-couple-de-la-requete.md).

## Risques

- Une propriétaire qui rend privée une note partagée la retire à l'autre pendant qu'il l'édite : sa connexion au document est fermée et ses dernières frappes non synchronisées sont perdues.
