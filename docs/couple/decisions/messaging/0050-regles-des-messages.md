---
nature: produit
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0050: Règles des messages

## Contexte

Les messages sont la dernière fonctionnalité du premier lot ([décision 0013](../0013-premier-lot.md)) : la photo instantanée, avec ses deux déclencheurs, spontané et invitation à heure aléatoire ([décision 0014](../0014-photo-instantanee.md)), et les messages flash, notifiés par Web Push. Les notifications partent de l'outbox par le relais de l'API ([décision 0021](../0021-outbox-postgresql-relais-dans-l-api.md)) ; les photos sont gardées sur le disque de la VM ([décision 0027](../0027-stockage-des-photos.md)). Le 2026-11-24, le propriétaire a répondu à deux séries de questions, puis validé une maquette (`Messages`, clair et sombre) : https://claude.ai/artifact/TqnctvMSZ4tRSVhGwyZFbP.

## Décision

- Un onglet « Messages », entre « Agenda » et « Nous ». Les photos et les mots restent dans un fil à deux, du plus récent au plus ancien. Réponse : « Gardée dans un fil (Recommandé) ».
- Un mot flash se choisit parmi des mots prêts ou s'écrit, 140 signes au plus. Réponse : « Mots prêts + texte libre (Recommandé) ».
- Une photo se prend par l'appareil photo du téléphone, puis un aperçu propose « Reprendre » ou « Envoyer ». Réponse : « Appareil du téléphone (Recommandé) ».
- Une invitation photo par jour, à une heure tirée au hasard entre 9 h et 21 h, la même pour les deux. La photo du jour de l'autre reste cachée tant qu'on n'a pas envoyé la sienne. Réponse : « 1/jour, même moment (Recommandé) ».
- On répond à l'invitation jusqu'à minuit ; une photo envoyée plus de 10 minutes après l'invitation porte « en retard ». Réponse : « Toute la journée (Recommandé) ».
- Seul l'auteur retire ce qu'il a envoyé, pour les deux. Réponse : « L'auteur seul (Recommandé) ».
- La notification reste discrète : « Ton âme sœur t'a envoyé quelque chose », jamais le texte d'un mot ni la photo. Réponse : « Message discret (Recommandé) ».
- Un événement d'agenda et une note qui deviennent visibles pour l'autre le notifient aussi, sans leur titre. Réponse : « Nouvel événement d'agenda », « Note partagée », cochés avec « Aucune pour l'instant », lus comme ces deux notifications et confirmés par « go » après la maquette. Ce point lève le « ni notification au premier lot » de la [décision 0046](../agenda/0046-regles-de-l-agenda.md) pour la création et le partage d'un événement, le reste de 0046 demeurant.

Réponse du propriétaire après la maquette, le 2026-11-24 : « go ».

## Alternatives écartées

- **Photo éphémère, vue une fois ou gardée 24 heures** : rien ne se revoit, alors que le fil fait un album du quotidien.
- **Double photo avant et arrière, façon BeReal** : une caméra dans la PWA, fragile sur iPhone ; l'appareil du téléphone suffit.
- **Invitation de 10 minutes** : une photo manquée pour une réunion ou un trajet ; « en retard » garde le rituel sans punir.
- **Mot en clair dans la notification** : lisible par quiconque voit l'écran verrouillé.
- **Retrait par les deux** : l'autre effacerait ce qu'on lui a envoyé.

## Conséquences

- Les règles sont écrites dans [les règles des messages](../../business-rules/messaging/rules.md), qui citent cette décision ; les règles de l'agenda (R10) et des notes (R9) reçoivent leur notification.
- Le contexte `messaging` arrive avec son backend, le relais de l'outbox et le Web Push (VAPID), puis le client et l'écran, une PR à la fois.
- Une tâche planifiée de l'API tire l'heure de l'invitation chaque jour, par un port de hasard injecté (`core.md` règle 19).

## Risques

- Sur iPhone, le Web Push ne marche que si la PWA est installée sur l'écran d'accueil (iOS 16.4 ou plus) : à vérifier sur les deux téléphones.
- Le poids et les formats d'une photo (R3) sont une proposition, à confirmer par le propriétaire.
- Un fil gardé sans limite grossit le disque de la VM : la sauvegarde nocturne ne copie que la base, pas les photos.
