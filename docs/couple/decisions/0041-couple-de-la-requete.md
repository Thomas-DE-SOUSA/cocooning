---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23 (« go » sur la PR #66)
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0041: Le couple de la requête vient de `pairing`

## Contexte

`authentication` et `pairing` travaillent sans `coupleId` (décisions 0029 et 0033). Les notes sont le premier contexte qui en a besoin : chaque port prend `coupleId` en premier ([décision 0023](0023-forme-des-use-cases-et-des-reactions.md), `core.md` règle 27). La session ne porte que l'identifiant du partenaire (`sub`, [décision 0034](0034-session-revocable.md)) : l'API doit trouver son couple.

## Décision

- L'API construit l'`ExecutionContext { coupleId, userId }` d'un contexte du couple à partir du `PartnerContext` de la session, par une lecture de `pairing` : le couple **formé** dont le partenaire est membre.
- La lecture passe par un port étroit, côté contexte qui en a besoin (`core-backend.md`, guard service de la [décision 0006](0006-guard-services-providers.md)), réalisé dans l'API par un provider Prisma en lecture seule sur `couple` et `couple_partner`.
- Un partenaire sans couple formé reçoit `404` sur toute route d'un contexte du couple, avec un code du contexte qui demande le couple ; la PWA le renvoie alors vers la mise en couple.
- Le `coupleId` n'est jamais mis dans le jeton : un couple annulé (R8 de `pairing`) ou formé après la connexion est pris en compte à la requête suivante.

## Alternatives écartées

- **`coupleId` dans le jeton de session** : il faudrait rouvrir une session à chaque changement du couple, et `authentication` dépendrait de `pairing`.
- **Chaque use case lit le couple lui-même** : la même lecture copiée dans tous les contextes.

## Conséquences

- Un décorateur ou un garde de l'API fournit l'`ExecutionContext` aux contrôleurs des contextes du couple ; le canal temps réel des notes ([décision 0040](notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)) fait la même résolution à la connexion.
- Une lecture par requête sur deux petites tables indexées : sans coût mesurable pour deux utilisateurs.

## Risques

- Si le couple venait un jour à se défaire, les données gardent leur `coupleId` : le sort des données d'un couple défait reste à décider avec « Quitter un couple » (`pairing`).
