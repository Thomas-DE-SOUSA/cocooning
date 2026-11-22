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

# 0007: Une PWA, sans application native

## Contexte

Les deux utilisateurs ont un iPhone et un Android. Malta a une application mobile Expo en plus de son web. Cocooning doit choisir son client mobile.

## Décision

Cocooning n'a pas d'application native. Le client est la PWA Next.js, avec Serwist pour le service worker et le Web Push par clés VAPID. Le paquet `client-business-logic` reste sans framework, pour qu'un autre client reste possible.

Mots du propriétaire, le 2026-11-22, sur les recommandations du blueprint : « OK pour tout ».

## Alternatives écartées

- **Une application Expo dès le départ** : deux clients à maintenir, et les magasins d'applications pour deux utilisateurs.
- **Une application native plus tard, préparée dès maintenant** : rien n'est préparé au-delà d'un `client-business-logic` sans framework, qui ne coûte rien.

## Conséquences

- Pas de `apps/couple/mobile`. La décision Malta sur le rangement du mobile devient le rangement de la PWA ([décision couple 0011](../../couple/decisions/frontend/0011-pwa-rangee-par-fonctionnalite.md)).
- Contrôle : la configuration `eslint-plugin-boundaries` de `config/eslint-config` interdit `react` et `next/*` dans `packages/couple/client-business-logic`.
- Pas de widget d'écran d'accueil ([décision couple 0014](../../couple/decisions/0014-photo-instantanee.md)).

## Risques

- Sur iPhone, le Web Push n'arrive qu'à une PWA installée sur l'écran d'accueil, et Safari limite le stockage d'une PWA peu utilisée.
