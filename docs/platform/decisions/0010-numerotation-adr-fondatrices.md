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

# 0010: Numérotation des décisions fondatrices de 0001 à 0012

## Contexte

Les décisions transférables de Malta (mocks, enums, identifiants, événements, câblage, gravité de review, front) portent des numéros dispersés, de 0005 à 0015, et des clauses de migration propres à son code existant. Cocooning les reprend comme décisions fondatrices.

## Décision

Les décisions fondatrices sont renumérotées de 0001 à 0012 dans le registre du domaine `couple`, dans l'ordre des décisions transverses puis des décisions front. Chacune cite le contrôle automatique qui la garantit, ou nomme celui qui la garantira et la phase qui le livre. Elles restent `proposée`, avec `validated-by: à compléter`, jusqu'à leur validation une par une par le propriétaire.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Garder les numéros de Malta** : un registre à trous, et des renvois qui laisseraient croire à des décisions absentes.
- **Les écrire sans contrôle** : une règle que seule la review tient finit par céder.

## Conséquences

- Le registre du domaine est [docs/couple/decisions/index.md](../../couple/decisions/index.md) ; ses décisions du propriétaire continuent à partir de 0013.
- Les décisions de plateforme ont leur propre numérotation, dans [ce registre](index.md). Le propriétaire a confirmé une séquence par registre, comme Malta, le 2026-11-22 (« P7 j'aime bien ») ; on cite « décision plateforme NNNN » ou « décision couple NNNN ».

## Risques

- Une décision fondatrice dont le contrôle n'est livré qu'en phase 5 ou 6 ne tient d'ici là que par la review.
