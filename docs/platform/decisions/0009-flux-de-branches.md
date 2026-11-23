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

# 0009: Flux de branches : `main`, `dev` et une branche par changement

## Contexte

Malta fait passer chaque branche par `staging` puis `main`. Le blueprint recommandait du trunk-based tant qu'il n'existe pas d'environnement de recette. Le propriétaire veut une branche stable et une branche d'intégration.

## Décision

- `main` est la branche stable.
- `dev` est la branche d'intégration et la branche par défaut.
- Chaque changement a sa branche, créée depuis `dev` (`feat/…`, `fix/…`, `chore/…`, `docs/…`), fusionnée dans `dev`, puis `dev` est fusionnée dans `main`.
- Aucun commit direct sur `main` ni sur `dev`. Les commits sont atomiques et conventionnels.

Mots du propriétaire, le 2026-11-22 : « git atomic branch main qui sera sur un dev puis chaque feature en branch ».

## Alternatives écartées

- **Trunk-based** (recommandation du blueprint) : pas de branche stable distincte de l'intégration.
- **Le flux Malta par `staging`** : un environnement de recette qui n'existe pas pour Cocooning.

## Conséquences

- Contrôle : `.validate-branch-namerc` et le hook `pre-commit` de Husky (phase 0) refusent un nom de branche hors convention ; `commitlint` refuse un message non conventionnel.
- Sans protection de branche sur le plan GitHub gratuit (D29, ouverte), l'interdiction de commit direct sur `main` et `dev` tient par discipline ; le hook peut aussi refuser un commit sur ces deux branches.

## Risques

- Un oubli de fusion de `dev` vers `main` laisse `main` en retard. La fusion se fait à la fin de chaque phase.
