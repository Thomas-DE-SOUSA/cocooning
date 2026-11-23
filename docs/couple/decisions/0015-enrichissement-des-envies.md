---
nature: produit
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0015: Nos envies d'abord, enrichies ensuite

## Contexte

Le second lot gère des listes d'envies (activités, films et séries à voir, lieux). On peut les remplir à la main, les tirer d'un catalogue externe, ou laisser une IA les proposer. La question est de savoir d'où vient la donnée et qui la trie.

## Décision

Le couple saisit ses envies, qui restent la source. Elles sont ensuite triées et complétées : par des API de référence (TMDB pour les films et séries, une API de lieux) et par une IA qui classe les envies et génère les questions. L'enrichissement complète une envie saisie, il n'en crée pas à la place du couple.

Mots du propriétaire, le 2026-11-22 : « ça me va mais on part toujours du principe où c'est nos envies puis elles sont triées ».

## Alternatives écartées

- **Des suggestions générées d'office par l'IA ou un catalogue** : la liste ne serait plus celle du couple.
- **Une saisie seule, sans enrichissement** : on perd affiches, horaires, adresses et classement automatique.

## Conséquences

- La fonctionnalité appartient au second lot ([décision 0013](0013-premier-lot.md)).
- Chaque API externe est derrière un port, avec son adaptateur et un fake pour les tests.
- Le fournisseur d'IA reste à choisir (D22, phase 7).

## Risques

- Une API externe peut changer ses conditions ou disparaître. L'envie saisie reste valable sans son enrichissement.
