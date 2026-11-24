---
nature: technique
status: remplacée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by: 0018
premortem:
---

# 0002: Dépôt privé, analyse de Malta gardée en local

## Contexte

Le dépôt Cocooning devait être créé et poussé sur un remote. Le dossier `_malta-blueprint/`, qui contient l'analyse de Malta, cite des extraits du code de Malta, propriété de son éditeur et publié « All Rights Reserved ». Ce code ne peut pas sortir du poste du propriétaire.

## Décision

Le dépôt est privé : `git@github.com:Thomas-DE-SOUSA/cocooning.git`. Le dossier `_malta-blueprint/` reste en local : il est listé dans `.gitignore` et n'est jamais versionné ni publié.

Mots du propriétaire, le 2026-11-22 : « Garder en local ».

## Alternatives écartées

- **Versionner `_malta-blueprint/` dans le dépôt privé** : le code propriétaire quitterait le poste et suivrait chaque clone, fork ou changement de visibilité du dépôt.
- **Un dépôt public** : exclu tant que le dépôt est la mémoire de travail du projet.

## Conséquences

- La documentation de `docs/` ne recopie jamais de code de Malta : elle décrit les principes et renvoie au blueprint par son nom de fichier.
- Un clone neuf n'a pas le blueprint ; le plan qui en découle est repris dans `docs/` et `_knowledge/` au fil des phases.
- Contrôle : l'entrée de `.gitignore` ; en phase 6, une étape de la CI échoue si `git ls-files _malta-blueprint` n'est pas vide.

## Risques

- Une copie d'extrait dans un autre fichier versionné échapperait au `.gitignore`. La review et la règle de `CLAUDE.md` sont la parade jusqu'à la CI.
- Le plan GitHub gratuit en privé n'offre pas de protection de branche (D29, ouverte).
