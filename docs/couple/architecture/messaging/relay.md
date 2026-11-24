# Relais des notifications

Cette page décrit le relais de l'outbox et l'envoi des notifications Web Push : ce qu'il lit, dans quel ordre, comment il évite d'envoyer deux fois et ce qu'il fait d'un échec. À lire avant de toucher à `OutboxRelayScheduler`, à `RelayOutboxEventsUseCase`, à `PushNotificationService` ou à une outbox.

## Rôle et limites

Le relais transforme les événements nouveaux des notes, de l'agenda et des messages en notifications discrètes (R10 et R11 des messages, R10 de l'agenda, R9 des notes). Il tourne dans le processus de l'API, sans worker ni file ([décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)). Ses choix techniques sont ceux de la [décision 0051](../../decisions/messaging/0051-relais-des-notifications.md). Le service worker qui affiche la notification arrive avec la PWA.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `OutboxRelayScheduler` | Un passage toutes les cinq secondes (`OUTBOX_RELAY_TICK_INTERVAL_MS`) si `OUTBOX_RELAY_ENABLED` vaut `true`, jamais deux à la fois ; un échec est journalisé et repris au passage suivant | `apps/couple/api/src/modules/messaging/primary/scheduler/outbox-relay.scheduler.ts` |
| `RelayOutboxEventsUseCase` | Dans une transaction (`UnitOfWork`) : réserve un lot, notifie, marque le lot publié à l'heure du passage | `application/use-cases/relay-outbox-events.use-case.ts` |
| `OutboxEventRepository`, `OutboxEventPrismaRepository` | `claimPending(limit)` : la seule lecture du relais entre couples ; `markPublished(events, publishedAt)` | `domain/ports/`, `apps/couple/api/src/modules/messaging/secondary/repositories/` |
| `pushNotificationsOf` | La table explicite des `EVENT_NAME` qui notifient, le genre et les destinataires ; une notification par couple, genre et destinataires dans un lot | `domain/models/push-notification-plan.ts` |
| `PushNotificationService` | Lit d'une requête les abonnements des couples du lot, envoie toutes les livraisons ensemble, oublie les abonnements disparus | `domain/services/push-notification.service.ts` |
| `PushNotificationSender`, `WebPushNotificationSender` | Port d'envoi et son adaptateur `web-push` : charge `{ "kind" }`, `TTL` de 12 heures, urgence `high`, `Topic` égal au genre, 2 secondes au plus par requête | `domain/ports/push-notification-sender.ts`, `apps/couple/api/src/modules/messaging/secondary/providers/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/messaging/`.

## Ce qui notifie qui

| Événement | Genre | Téléphones |
|---|---|---|
| `FlashMessageSentEvent`, `InstantPhotoSentEvent` (spontanée ou photo du jour) | `MESSAGE_RECEIVED` | Ceux de l'autre partenaire |
| `PhotoPromptIssuedEvent` | `PHOTO_PROMPT_ISSUED` | Ceux des deux partenaires |
| `CalendarEventCreatedEvent` de visibilité `SHARED`, `CalendarEventSharedEvent` | `CALENDAR_EVENT_ADDED` | Ceux de l'autre partenaire |
| `NoteCreatedEvent` de visibilité `SHARED`, `NoteSharedEvent` | `NOTE_SHARED` | Ceux de l'autre partenaire |
| Tout autre événement, ou une donnée illisible | aucun | aucun ; l'événement est marqué publié |

« L'autre partenaire » est tout téléphone abonné du couple dont le propriétaire n'est pas le `user_id` de l'événement.

## Points d'attention

- **Ordre.** Une requête par outbox, `WHERE published = false ORDER BY occurred_at, id LIMIT 50 FOR UPDATE SKIP LOCKED`, servie par l'index `(published, occurred_at)` ; les trois résultats sont fusionnés par `occurred_at` puis identifiant et coupés à 50. Les lignes réservées en trop restent non publiées et passent au tour suivant.
- **Au moins une fois.** La réserve, les envois et le marquage partagent une transaction. Une erreur de base ou un délai de transaction annule tout : le lot repart au passage suivant. Les envois partent en parallèle et `PUSH_REQUEST_TIMEOUT_MS` les borne sous `DB_TX_TIMEOUT_MS`.
- **Jamais deux fois en temps normal.** Deux processus ou deux passages se partagent les lignes par `SKIP LOCKED`, et `markPublished` ne touche que `published = false`.
- **Un refus n'est jamais réessayé.** `404` et `410` font oublier l'abonnement (R11) ; toute autre erreur est journalisée (`pushSubscriptionId`, genre, statut) et l'événement est publié quand même. Une ligne illisible ne bloque pas la file : elle ne notifie personne.
- **L'historique ne sonne pas.** La migration `20261124234500_messaging_push_subscription` a marqué publiés les événements écrits avant le relais. `pairing_event` n'est pas lu.
- **Pas de contenu.** Ni la charge, ni un log, ni une erreur ne portent un texte, un titre, une photo, l'adresse d'un téléphone ou ses clés (`core.md` règles 30 et 33). L'erreur de `web-push` porte l'adresse : seul son statut est journalisé.
- **Le relais n'est pas un abonné de `EventPublisher`** : la publication en processus après chaque sauvegarde reste un simple journal, sinon chaque notification partirait deux fois.
- **E2E.** Le minuteur est coupé (`OUTBOX_RELAY_ENABLED=false`) ; `MessagingTestApp.relay()` appelle `tick()` et un `FakePushNotificationSender` remplace l'envoi réel.

## Décisions liées

- [Décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md) : outbox PostgreSQL relayée dans l'API
- [Décision 0051](../../decisions/messaging/0051-relais-des-notifications.md) : choix techniques du relais
- [Décision 0004](../../decisions/0004-noms-evenements-litteral.md) : la table explicite des `EVENT_NAME`
