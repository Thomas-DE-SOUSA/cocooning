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

# 0008: Langues du dépôt

## Contexte

Le dépôt mélange code, consignes pour les agents, documentation et commits. Malta écrit sa knowledge en anglais et sa documentation en français, sans l'avoir écrit à un seul endroit.

## Décision

- **En anglais** : le code, le `CLAUDE.md` racine, `_knowledge/` et les messages de commit.
- **En français** : `docs/`, prose en français, identifiants de code en anglais entre backticks.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Tout en anglais** : la documentation métier se lit et se valide mieux dans la langue du propriétaire.
- **Tout en français** : les identifiants et les consignes aux agents restent plus précis et plus courts en anglais, et les commits suivent la convention conventionnelle.

## Conséquences

- Contrôle : `commitlint` (phase 0) impose le format conventionnel des commits ; en phase 5, `scripts/check-docs.mjs` vérifie la forme des pages de `docs/` (titre, index, liens).

## Risques

- Un terme métier traduit différemment entre le code et `docs/` brouille le langage ubiquitaire. Les glossaires de module font le pont.
