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

# 0026: Pas de rôles ni de permissions, une portée par couple et par propriétaire

## Contexte

Malta contrôle l'accès par rôles et permissions `ressource:action` (hiérarchie `read < write < manage`, joker `*`), un `RolesGuard`, un `ActiveTenantGuard` sur l'en-tête du tenant actif et un `MessagingModule` SQS. Cocooning a deux utilisateurs égaux dans un seul couple : aucun ne peut plus que l'autre. Décision S1 du propriétaire.

## Décision

- Un guard d'authentification vérifie le partenaire connecté et fournit `coupleId` et `userId` au contexte du use case ([décision 0023](0023-forme-des-use-cases-et-des-reactions.md)).
- L'accès à une donnée se décide par sa portée : `coupleId` dans chaque requête, `ownerId` et la visibilité (`PRIVATE`, `SHARED`) dans le domaine ; la donnée privée de l'autre partenaire répond 404 ([décision 0018](0018-portee-par-couple-et-proprietaire.md)).
- On ne reprend ni le modèle de permissions, ni `RolesGuard`, ni `ActiveTenantGuard`, ni `MessagingModule`, ni `WorkerGuard`, ni la table `tenant`.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Le modèle de permissions de Malta, vidé de ses ressources** : une hiérarchie et une matrice route → permission à maintenir pour deux comptes qui ont les mêmes droits.

## Conséquences

- `packages/couple/shared-kernel` n'a pas de dossier `authorization/` ; `server-infrastructure` n'a ni `RolesGuard` ni décorateur de permission.
- Les tests d'E2E vérifient l'isolation par couple et par propriétaire, pas une matrice de permissions.

## Risques

- Un besoin de droits différents (un invité, un enfant) demandera une nouvelle décision : la portée par propriétaire reste la base sur laquelle l'ajouter.
