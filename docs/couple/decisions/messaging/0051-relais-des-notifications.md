---
nature: technique
status: proposée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0051: Le relais des notifications, dans l'API, au moins une fois

## Contexte

Les règles R10 et R11 des messages, R10 de l'agenda et R9 des notes demandent une notification Web Push discrète quand l'autre envoie un mot, partage une note ou un événement, et quand l'invitation photo part. Les événements sont déjà écrits dans les outbox `note_event`, `agenda_event` et `messaging_event` ([décision 0021](../0021-outbox-postgresql-relais-dans-l-api.md)), mais rien ne les lisait. La forme générale (charge réduite au genre de la notification, destinataires, abonnements par téléphone, relais dans l'API, envoi par le paquet `web-push`) vient du cadrage du propriétaire ; cette décision fixe les choix techniques que le cadrage laissait ouverts.

## Décision

- **La charge est le genre seul** : `{ "kind": <PushNotificationKind> }`. La PWA porte les phrases françaises. Le `Topic` de la requête vaut le genre : le service de notification remplace une notification en attente par la plus récente du même genre.
- **Le relais tourne dans l'API**, `OutboxRelayScheduler`, toutes les cinq secondes, coupé par `OUTBOX_RELAY_ENABLED`. Chaque passage ouvre une transaction, réserve au plus 50 événements non publiés des trois outbox (`SELECT … FOR UPDATE SKIP LOCKED`, une requête par table, fusion par `occurred_at`), envoie leurs notifications, puis marque publiés tous les événements réservés, notifiants ou non, avant la validation.
- **Au moins une fois, jamais en boucle.** Un échec de la transaction (base, délai) annule le passage : les événements restent à publier et le passage suivant les renvoie. Un refus du service de notification n'annule rien : `404` et `410` font oublier l'abonnement (R11), toute autre erreur (délai, `429`, `5xx`) est journalisée par l'identifiant de l'abonnement et la notification est perdue.
- **Les événements d'avant le relais ne sonnent pas.** La migration `20261124234500_messaging_push_subscription` marque publiés tous les événements non publiés des trois outbox : le premier passage en production ne voit que les événements nouveaux.
- **Le relais n'utilise pas `EventPublisher`.** Le port publie déjà en processus après chaque sauvegarde (`EventPublishingService`) ; un abonné qui y enverrait les notifications les enverrait deux fois, après la sauvegarde puis par le relais.
- **Les règles de notification vivent dans `messaging`**, qui lit les classes d'événements de `notes` et d'`agenda` pour leur `EVENT_NAME` ([décision 0004](../0004-noms-evenements-litteral.md)) : ces événements sont le langage publié de ces contextes.
- **Un abonnement oublié est supprimé**, sans `deleted_at` : il n'a pas d'histoire et ses clés sont des secrets du téléphone.

## Alternatives écartées

- **Réserver en marquant publié avant l'envoi** (`concurrency.md` règle 13 d'avant) : un arrêt de l'API entre la réserve et l'envoi perd la notification, sans trace.
- **Réessayer une notification refusée** : il faudrait un compteur d'essais et un délai par abonnement ; pour deux personnes, une notification perdue de temps en temps coûte moins qu'une file de reprise.
- **Rejouer l'historique au premier déploiement** : des dizaines de notifications d'un coup pour des notes et des événements déjà vus.
- **Un worker séparé ou une file** : écartés par la décision 0021.

## Conséquences

- Les envois d'un passage tiennent dans la transaction : `PUSH_REQUEST_TIMEOUT_MS` (2 s) borne chaque requête, envoyées en parallèle, sous `DB_TX_TIMEOUT_MS` (5 s en production).
- Deux processus de l'API ne notifient pas deux fois le même événement : le second saute les lignes réservées.
- `pairing_event` n'est lu par personne ; ses lignes restent non publiées.

## Risques

- Un service de notification très lent fait expirer la transaction : le passage est annulé et ses notifications partent de nouveau au passage suivant, en double pour les téléphones déjà servis.
