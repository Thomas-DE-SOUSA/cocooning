---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0025: Pagination par offset, curseur pour le défilement infini

## Contexte

Les listes de Cocooning sont courtes (notes, événements d'agenda) sauf deux fils qui grossissent sans fin : les photos instantanées et les messages flash, lus en défilement infini sur mobile. Malta pagine par offset. Décision D14 du propriétaire.

## Décision

- Par défaut, une liste se pagine par offset : `page` commence à 1, `pageSize` vaut 25. Les paramètres et la réponse paginée sont des schémas Zod du contrat, partagés par toutes les listes.
- Un fil en défilement infini (photos, messages) se pagine par curseur : le curseur est l'identifiant UUID v7 du dernier élément reçu, trié par ordre décroissant ; la réponse donne le curseur suivant ou `null`.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Offset partout** : un message reçu pendant le défilement décale les pages, on revoit un élément ou on en perd un.
- **Curseur partout** : impossible d'aller à une page donnée, pour des listes qui n'en ont pas besoin.

## Conséquences

- Le shared-kernel expose `PaginationParams` ; le contrat expose `PaginationQuerySchema`, `PaginatedResponseSchema` et leurs pendants par curseur.
- Le tri par UUID v7 suit l'ordre de création, sans colonne de plus ([décision 0024](0024-determinisme-horloge-et-identifiants.md)).

## Risques

- Un identifiant de curseur est lisible par le client : il ne porte rien d'autre que l'identifiant, déjà connu du client.
