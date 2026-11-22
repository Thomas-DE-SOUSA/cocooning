---
nature: produit
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-22
validated-on: 2026-11-22
supersedes:
superseded-by:
premortem:
---

# 0014: La photo instantanée, dans la PWA

## Contexte

L'un des usages voulus est d'envoyer à l'autre une photo prise sur le moment. Sur iPhone et Android, un widget d'écran d'accueil demande une application native, que Cocooning n'a pas ([décision plateforme 0007](../../platform/decisions/0007-pwa-sans-application-native.md)).

## Décision

La photo se prend dans la PWA et part directement à l'autre, qui reçoit une notification Web Push « ton âme sœur t'a envoyé quelque chose ». Deux déclencheurs coexistent :

- **spontané** : l'un des deux prend et envoie une photo quand il veut ;
- **invitation** : à une heure aléatoire, à la façon de BeReal, l'application invite à prendre une photo.

Mots du propriétaire, le 2026-11-22, sur les deux déclencheurs : « on peut faire les deux ».

## Alternatives écartées

- **Un widget natif d'écran d'accueil** : il exige une application native par plateforme, écartée.
- **Un seul déclencheur** : le spontané seul perd le rituel de l'invitation ; l'invitation seule interdit d'envoyer sur le moment.

## Conséquences

- La fonctionnalité appartient au contexte des messages du premier lot ([décision 0013](0013-premier-lot.md)).
- L'invitation à heure aléatoire demande une tâche planifiée côté API et une source de hasard derrière un port injecté, testable.
- Le lieu de stockage des photos reste à décider avec le contexte des messages.

## Risques

- Sur iPhone, le Web Push d'une PWA n'est reçu que si elle est installée sur l'écran d'accueil. L'installation fait partie de la première connexion.
