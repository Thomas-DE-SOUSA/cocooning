---
nature: technique
status: proposée
date: 2026-11-22
deciders: []
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0005: Les domain services ne sont pas des providers

## Contexte

Un domain service est pur : il ne porte aucun état et ne dépend que des arguments et des ports qu'on lui passe. Dans Malta, deux fiches de la knowledge se contredisaient sur son câblage NestJS (instanciation en ligne ou provider exporté), et quelques modules avaient suivi la mauvaise. Cocooning fixe la règle avant le premier module.

## Décision

Un domain service n'est pas un provider NestJS : il est instancié en ligne dans la factory `useFactory` du use case qui l'utilise, avec les ports dont il a besoin. Le module service exporte les use cases et les handlers, jamais un domain service. Les services applicatifs (`application/services/`) restent des providers injectables ([décision 0006](0006-guard-services-providers.md)).

## Alternatives écartées

- **Déclarer chaque domain service comme provider** : une entrée de câblage et une exportation de plus pour un objet sans état, sans rien gagner.
- **Laisser le choix module par module** : un agent reproduit l'une ou l'autre forme selon la fiche qu'il charge.

## Conséquences

- **Contrôle automatique** : `scripts/check-wiring.mjs`, livré en phase 2 avec le premier module service de `apps/couple/api`, échoue si une classe importée de `domain/services/` figure dans `providers` ou `exports` d'un `*-service.module.ts`. La lentille de câblage de `/coco-review` (phase 5) le reprend.
- `_knowledge/` (câblage backend) et le modèle de module service de l'orchestrateur disent la règle.

## Risques

- Un domain service instancié dans plusieurs factories répète la liste de ses ports. Si cette liste grossit, c'est un service applicatif mal rangé.
