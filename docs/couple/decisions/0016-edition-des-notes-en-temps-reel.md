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

# 0016: Édition des notes à deux en temps réel

## Contexte

Les notes partagées, dont la note « Courses », sont modifiées par les deux membres du couple, parfois en même temps (l'un au magasin, l'autre à la maison). Sans synchronisation, la dernière sauvegarde écrase l'autre.

## Décision

Les notes s'éditent à deux en temps réel, avec un éditeur riche de type Tiptap et une synchronisation par CRDT de type Yjs. Les fonctions suivent Apple Notes et Google Keep (titres, listes, cases à cocher, mise en forme).

Mots du propriétaire, le 2026-11-22 : « P5 temps réel ».

## Alternatives écartées

- **Le dernier qui sauvegarde gagne** : simple, mais perd des modifications dès que les deux éditent la même note.
- **Un verrou d'édition** : un seul éditeur à la fois, frustrant pour une liste de courses tenue à deux.

## Conséquences

- La synchronisation demande un canal temps réel entre les deux appareils et l'API, à concevoir avec le contexte des notes.
- Le contenu d'une note est un document CRDT ; l'agrégat note garde ses métadonnées (titre, propriétaire, partage) et la portée de la [décision 0018](0018-portee-par-couple-et-proprietaire.md) s'applique aussi au canal temps réel.
- Le choix exact des bibliothèques est confirmé au début de la phase qui construit les notes.

## Risques

- Un CRDT stocke un historique qui grossit avec les modifications. La compaction des documents est à prévoir.
- Le mode hors ligne d'une PWA rend les fusions plus fréquentes ; c'est précisément ce que le CRDT absorbe.
