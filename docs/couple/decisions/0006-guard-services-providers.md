---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0006: Les guard services sont des providers injectables

## Contexte

Un guard service vérifie qu'une action est permise en lisant l'état d'un autre contexte par un port. Il n'est donc pas pur et appartient à la couche application. Malta l'a d'abord rangé avec les domain services (instanciation en ligne), alors que le code et les modèles le déclaraient déjà en provider. La [décision 0005](0005-domain-services-hors-providers.md) fixe le câblage des domain services ; celle-ci fixe celui des guard services.

## Décision

Un guard service est un service applicatif : il est déclaré comme provider NestJS par `useFactory` dans le module service, et injecté dans les factories des use cases qui l'utilisent. Il n'est jamais construit par `new` dans une factory de use case.

## Alternatives écartées

- **L'instancier en ligne comme un domain service** : la prémisse (« il est pur ») est fausse, et chaque use case qui l'utilise répéterait ses ports.
- **Laisser le choix module par module** : deux câblages dans un même module, et une review qui signale l'un ou l'autre.

## Conséquences

- **Contrôle automatique** : `scripts/check-wiring.mjs` (phase 2, voir décision 0005) échoue aussi sur un `new XxxGuardService(` dans un `*-service.module.ts`.
- Un guard service partagé par plusieurs use cases n'est construit qu'une fois par module, et ses ports apparaissent une seule fois dans `inject`.

## Risques

- Un guard service sans port gagne une entrée de câblage pour rien. Le coût est accepté pour garder une seule règle.
