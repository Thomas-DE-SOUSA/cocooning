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

# 0017: Le couple est l'objet pivot, sans contexte composite

## Contexte

Malta organise une partie de son domaine autour d'un objet pivot dont l'identifiant traverse plusieurs étapes, dans un contexte composite. Cocooning doit dire à qui appartient chaque donnée et s'il a besoin de cette forme.

## Décision

Le pivot est le couple : chaque donnée lui appartient. Il n'y a pas de contexte composite ; chaque bounded context est autonome et porte l'identifiant du couple.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Aucun pivot** : chaque contexte choisirait sa façon de rattacher une donnée à ses propriétaires.
- **Un pivot avec contexte composite** : un module parent et un `shared/` en couches, sans flux métier en étapes qui le justifie.

## Conséquences

- La portée des données suit la [décision 0018](0018-portee-par-couple-et-proprietaire.md).
- Les ports transverses d'un composite (D27) ne se posent pas tant qu'aucun composite n'existe.

## Risques

- Si un flux en étapes apparaît (par exemple une activité planifiée, réalisée puis notée), cette décision sera remplacée par une nouvelle.
