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

# 0019: Authentification locale, deux comptes

## Contexte

Malta s'appuie sur un fournisseur d'identité central et un domaine IAM. Cocooning a deux utilisateurs, une VM accessible par Tailscale et aucun besoin d'organisation ni de rôles.

## Décision

L'authentification est un bounded context local à Cocooning (option A du blueprint) : deux comptes, mots de passe hachés par Argon2id, JWT dans un cookie, session longue. Tailscale s'ajoute comme barrière réseau, sans remplacer l'authentification applicative.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **B, un fournisseur d'identité central façon Malta** (domaine IAM, serveur OAuth) : une infrastructure entière pour deux comptes.
- **C, un fournisseur managé** (Auth0, Clerk, Zitadel) : un tiers et un abonnement pour deux comptes, et une dépendance externe pour une app auto-hébergée.

## Conséquences

- La vérification du JWT arrive en phase 2, le contexte complet (connexion, session, changement de mot de passe) au plus tard en phase 7.
- La vérification reste derrière une API publique, ce qui laisse une bascule vers B ou C possible par un adaptateur.
- Pas de domaine IAM, pas de permissions fines : la portée des données suit la [décision 0018](0018-portee-par-couple-et-proprietaire.md).

## Risques

- Une session longue volée reste valide longtemps. Tailscale limite qui peut l'utiliser ; la révocation d'une session est à prévoir dans le contexte d'authentification.
