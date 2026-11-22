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

# 0002: Enums en objets `as const`

## Contexte

TypeScript offre le mot-clé `enum`. Un `enum` numérique crée une table inverse, un `enum` de chaînes donne un type nominal qui refuse le littéral équivalent venu d'un contrat Zod ou de Prisma. Malta a interdit `enum` après en avoir écrit une cinquantaine, puis a dû suivre leur conversion comme une dette. Cocooning n'a pas encore de code.

## Décision

Un ensemble fermé de valeurs s'écrit en objet `as const` avec son type dérivé, jamais avec `enum`. La règle s'applique dès le premier fichier.

## Alternatives écartées

- **Autoriser `enum`** : table inverse pour les enums numériques, incompatibilité avec les littéraux des contrats et de Prisma pour les enums de chaînes. L'objet `as const` est un vrai objet JavaScript, se parcourt par `Object.values()` et se compare aux littéraux.
- **Laisser le choix à chaque contexte** : deux formes pour une même notion, et une review qui signale l'une ou l'autre selon la fiche qu'elle charge.

## Conséquences

- **Contrôle automatique** : `no-restricted-syntax` sur `TSEnumDeclaration` dans `config/eslint-config`, livré en phase 0. `pnpm lint` échoue sur tout `enum`.
- La règle vit dans `_knowledge/core.md` ; les modèles de l'orchestrateur écrivent des objets `as const`.

## Risques

- Aucun risque notable : la règle ne coûte rien sur un projet neuf.
