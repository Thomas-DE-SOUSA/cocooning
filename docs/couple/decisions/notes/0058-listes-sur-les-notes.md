---
nature: produit
status: acceptée
date: 2026-11-26
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-26
validated-on: 2026-11-26
supersedes:
superseded-by:
premortem:
---

# 0058: L'onglet Listes, des notes à cocher

## Contexte

Les vocaux du couple du 2026-11-25 (D54) demandent des listes de courses perso et communes, à catégories, à cocher, en voyant qui a coché ; des listes de tâches qui marchent pareil (« Noël : acheter le cadeau de maman ») ; et une liste d'envies. Le glossaire disait jusqu'ici qu'une liste de courses est une note titrée « Courses », sans concept propre. Les notes savent déjà les cases à cocher, l'écriture à deux en direct (décision 0040) et le perso ou partagé (R4, R10). La maquette `Listes` a été validée : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

- Un onglet **Listes** entre Agenda et Messages, à trois sections : Courses, Tâches, Envies. Réponse : « Courses / Tâches / Envies (Recommandé) ».
- **Une liste de courses ou de tâches est une note à cocher** rangée dans sa section : elle garde le direct, la présence de l'autre et le perso ou commun des notes. Réponse : « Sur les notes (Recommandé) ». Elle a un titre (« Carrefour », « Noël ») et un emoji facultatif, et n'apparaît que dans l'onglet Listes, jamais dans les espaces des notes.
- Chaque ligne cochée garde **qui l'a cochée** et en prend la couleur, vue par qui regarde : terre cuite pour « Moi », sauge pour « Toi ». Elle se barre et descend dans « Fait » ; décocher la remonte ; « Vider les faits » retire les lignes cochées pour les deux. Réponse : « Barrée, descend en bas (Recommandé) ».
- **En direct** à deux, avec la présence de l'autre dans la liste. Réponse : « En direct (Recommandé) ».
- L'accueil range les listes en « Communes » et « Rien que pour moi » et dit ce qui reste à prendre ou à faire.
- Une tâche n'a pas de date : une date va dans l'agenda.
- **Envies** : chacun a sa liste (nom, catégorie, lien), vue par l'autre, qui peut marquer « Je m'en occupe » sans que le propriétaire le voie. Réponse : « Chacun la sienne, vue par l'autre (Recommandé) ». Comme l'autre ne doit pas voir ce marquage, les envies ne sont pas une note partagée : elles ont leur modèle côté serveur, au second lot, avec leur décision.

Réponse du propriétaire après la maquette, le 2026-11-26 : « go ».

## Alternatives écartées

- **Un nouveau module de listes** (articles un par un, rafraîchi toutes les quelques secondes) : plus simple à compter, mais il refait le direct et le partage que les notes ont déjà.
- **Lignes barrées sur place** : la liste se mélange en faisant les courses.
- **Listes visibles aussi dans les notes** : deux chemins vers le même objet.
- **Couleurs de catégorie** : l'emoji suffit à reconnaître une liste.

## Conséquences

- Règles R26 à R32 dans [les règles des listes](../../business-rules/notes/rules/lists.md) ; glossaires des notes et transverse mis à jour.
- Lots : courses et tâches (serveur, client, écran, release), puis envies.

## Risques

- Le décompte de l'accueil se calcule à l'enregistrement du document de la liste : il peut retarder de quelques secondes sur l'écriture en cours.
- « Vider les faits » ne garde pas d'historique.
