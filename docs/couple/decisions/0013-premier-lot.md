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

# 0013: Le premier lot : notes, agenda partagé et messages

## Contexte

Cocooning est une PWA pour un couple. Les idées sont nombreuses (notes, courses, agenda, photos, activités, wishlist, films à voir, questions, lieux) et l'architecture reprise de Malta coûte cher par bounded context. Il faut un premier lot livrable, puis un second.

## Décision

Le premier lot comprend trois fonctionnalités :

1. **Notes riches**, personnelles ou partagées. Les courses sont une note ordinaire titrée « Courses », sans module ni catalogue dédiés.
2. **Agenda partagé**.
3. **Messages** : photo instantanée et mots flash, avec notification Web Push.

Le second lot comprend les activités, la wishlist, le visionnage, les questions générées par IA, les fiches lieux et l'enrichissement.

Mots du propriétaire, le 2026-11-22 : « pour moi les courses c'est une note classique mais titrée courses ».

## Alternatives écartées

- **Un module de courses dédié, avec catalogue d'articles** : un bounded context de plus pour un besoin que la note couvre ; écarté par le propriétaire.
- **Tout livrer d'un coup** : le second lot dépend d'API externes et d'un assistant IA encore à choisir (D22).

## Conséquences

- Les premiers bounded contexts portent les notes, l'agenda et les messages ; leur nom suit le langage ubiquitaire écrit en phase 2.
- L'édition des notes est temps réel ([décision 0016](0016-edition-des-notes-en-temps-reel.md)) ; la photo instantanée suit la [décision 0014](0014-photo-instantanee.md).
- Le Web Push est nécessaire dès le premier lot, d'où l'outbox de la [décision 0021](0021-outbox-postgresql-relais-dans-l-api.md).

## Risques

- Une note « Courses » ne coche pas d'articles comme une liste dédiée. L'éditeur doit donc offrir des cases à cocher, comme Apple Notes et Google Keep.
