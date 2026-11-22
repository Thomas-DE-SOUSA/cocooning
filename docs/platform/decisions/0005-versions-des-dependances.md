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

# 0005: Versions des dépendances majeures

## Contexte

Malta fige TypeScript 5.9, Next 15.5, Jest 29 et Zod 3.25, et ses modèles de code en dépendent. Cocooning démarre fin 2026 : partir sur des versions déjà dépassées impose une montée de version dès la première année. Le blueprint recommandait la parité avec Malta.

## Décision

- **Versions majeures** : les dernières versions stables, soit Next 16, Jest 30 et la version de TypeScript la plus récente que supporte typescript-eslint. Elles sont confirmées pendant la phase 0.
- **Zod** : Zod 4 si `@t3-oss/env-nextjs` et `@hookform/resolvers` le supportent, sinon Zod 3.25.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Parité stricte avec Malta** (TS 5.9, Next 15.5, Jest 29, Zod 3.25) : les modèles se copient sans adaptation, mais une montée de version est due dès le départ.
- **Zod 4 sans condition** : une bibliothèque de formulaire ou d'environnement non compatible bloquerait le socle web.

## Conséquences

- Les modèles repris de Malta s'adaptent aux API de ces versions au moment où on les copie.
- Contrôle : les versions vivent dans les catalogues de `pnpm-workspace.yaml` ; `pnpm install --frozen-lockfile`, `pnpm build` et `pnpm check-types` en phase 0 prouvent leur compatibilité.

## Risques

- Une dépendance secondaire peut tarder à suivre une version majeure. Le choix conditionnel de Zod en est l'exemple ; le même repli vaut pour les autres.
