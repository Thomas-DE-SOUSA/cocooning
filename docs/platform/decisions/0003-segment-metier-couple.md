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

# 0003: Le segment métier s'appelle `couple`

## Contexte

Malta range son domaine sous un segment (`warehouse`) qui apparaît dans `apps/`, `packages/`, `docs/` et dans les noms de paquets. Le blueprint notait ce segment `product`, valeur neutre à remplacer par le nom métier.

## Décision

Le segment métier de Cocooning est `couple` : `apps/couple/<app>`, `packages/couple/<paquet>`, `docs/couple/`, paquets `@cocooning/couple-*`. Le niveau de segment est gardé même avec un seul domaine.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Garder `product`** : un nom sans sens métier, et une collision avec une éventuelle entité « produit » dans les recherches.
- **Supprimer le niveau de segment** : il faudrait tout déplacer le jour où un second domaine arrive, comme Malta l'a évité en ajoutant le sien.

## Conséquences

- Le renommage `product` vers `couple` s'applique à toute l'arborescence cible du blueprint.
- Contrôle : la configuration `eslint-plugin-boundaries` de `config/eslint-config` (phase 0) déclare le segment `couple` et interdit les imports entre domaines.

## Risques

- Le mot `couple` est aussi un terme métier (l'objet pivot, [décision couple 0017](../../couple/decisions/0017-couple-objet-pivot.md)). Le contexte d'un chemin suffit à les distinguer.
