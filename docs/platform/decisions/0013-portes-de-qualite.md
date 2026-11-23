---
nature: technique
status: acceptée
date: 2026-11-23
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0013: Couverture de 100 % sur le code métier, sans Stryker

## Contexte

Malta empile plusieurs portes de qualité : couverture, tests de mutation Stryker, Playwright, Sonar. Cocooning doit choisir les siennes avant la phase 3 (décision D18 du propriétaire), pour deux utilisateurs et un seul développeur (décision P1). En phase 2, le code métier du serveur atteignait 100 % de couverture sans que rien ne l'impose.

## Décision

- Les packages de code métier (`couple/server-business-logic`, puis `couple/client-business-logic` et les presenters de la PWA) exigent 100 % de couverture : lignes, branches, fonctions et instructions. Leur `pnpm test` lance Jest avec `--coverage` et échoue sous ce seuil.
- La couverture se mesure sur `src/`, hors specs, hors `__tests__/` et hors barrels `index.ts`.
- Pas de Stryker, pas de Sonar. Les autres packages ont des tests sans seuil.

## Alternatives écartées

- **Couverture et Stryker à 90 %** : les tests de mutation prouvent mieux la force des assertions, mais multiplient le temps de test pour un gain faible sur un code métier de cette taille.
- **Pas de seuil** : la couverture de la phase 2 tient par discipline ; un seuil la garde sans y penser.

## Conséquences

- `packages/couple/server-business-logic/jest.config.mjs` porte le seuil ; tout nouveau package de code métier le reprend.
- Une branche impossible à couvrir est un signe de code mort (`core.md rule 4`), pas une raison de baisser le seuil.

## Risques

- 100 % de couverture n'empêche pas une assertion faible. Le canon des tests de use case (`_knowledge/backend/use-case-tests.md`) exige des assertions exactes.
