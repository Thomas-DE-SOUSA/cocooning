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

# 0018: Portée des données par `coupleId` et `ownerId`, sans multi-tenant

## Contexte

Malta est multi-tenant : un `tenantId` traverse les ports, les index et les requêtes. Cocooning sert un seul couple, mais distingue les données partagées des données personnelles (une note perso n'est pas visible de l'autre).

## Décision

Cocooning n'est pas multi-tenant. Le `coupleId` est présent dans les ports et les index, et chaque donnée porte son `ownerId`. Une donnée personnelle de l'autre répond `404`, jamais `403`, pour ne pas révéler son existence.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Multi-tenant complet** : isolation, gestion de tenants et permissions par tenant, pour un seul couple.
- **Aucun identifiant de couple, seulement le propriétaire** : coût nul aujourd'hui, mais un rattrapage irréversible si un second couple arrive un jour.

## Conséquences

- Le contexte de requête porte `coupleId` et `userId` ; chaque repository filtre par `coupleId`, puis par `ownerId` pour une donnée personnelle.
- Le canal temps réel des notes ([décision 0016](0016-edition-des-notes-en-temps-reel.md)) applique la même portée.
- Contrôle : en phase 2, la spec E2E de matrice d'accès de `apps/couple/api` vérifie, route par route, qu'une donnée personnelle de l'autre répond `404`.

## Risques

- Un repository qui oublie le filtre `ownerId` expose une note perso à l'autre. La matrice d'accès E2E est la parade.
