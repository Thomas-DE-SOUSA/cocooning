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

# 0011: Backend en CommonJS sur NestJS 11

## Contexte

La [décision plateforme 0005](0005-versions-des-dependances.md) retient les dernières versions stables. NestJS 12 (sorti le 2026-11-20) et `uuid` 12 et plus ne sont publiés qu'en ESM, alors que le dépôt compile et teste en CommonJS (Jest 30 et ts-jest, comme Malta). Passer en ESM touche tous les packages backend et l'outillage de test.

## Décision

- Le backend reste en CommonJS : NestJS 11 (11.2.x), `uuid` 11, Jest 30 et ts-jest.
- Zod 4 (entrée CommonJS disponible) et pino 10 suivent la décision plateforme 0005.
- La migration vers NestJS 12 et l'ESM se fera en une seule décision, quand l'outillage de test la permettra sans fragilité.

Réponse du propriétaire, le 2026-11-22, à la question « Quelle base pour le backend ? » : « Nest 11 en CommonJS (Recommandé) ».

## Alternatives écartées

- **NestJS 12 en ESM avec Jest en mode `--experimental-vm-modules`** : le support ESM de Jest reste expérimental (mocks de modules, résolution).
- **NestJS 12 en ESM avec Vitest** : s'écarte de Malta et refait `config/jest-config` et les tests déjà écrits.

## Conséquences

- Avant d'ajouter une dépendance runtime backend, vérifier qu'elle publie une entrée CommonJS (`npm view <paquet> type exports`).
- Le catalogue `nest` de `pnpm-workspace.yaml` épingle la majeure 11.

## Risques

- NestJS 11 cessera un jour d'être maintenu : la migration ESM deviendra alors obligatoire.
