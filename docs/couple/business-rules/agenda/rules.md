# Règles de l'agenda

Ce que le couple veut que l'app impose à l'agenda. À lire avant de toucher au contexte `agenda` ou à l'écran de l'agenda.

## À la création

### R1. Un événement appartient au couple et à celui qui le crée

Je crée un événement : il est à notre couple, et j'en suis l'auteur. Ma couleur le marque.

- Dans le code : `CreateCalendarEventUseCase`, `CalendarEvent.create` ; dans la PWA, la couleur de l'auteur par `presentAuthorColor` (`apps/couple/web/src/modules/agenda/`).
- Source : [décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-24.

### R2. Un événement a un titre

Je donne toujours un titre à un événement ; les espaces autour ne comptent pas, un titre vide est refusé. Il fait 120 signes au plus, comme le titre d'une note.

- Dans le code : `CalendarEventTitle.create`, `CALENDAR_EVENT_TITLE_MAX_LENGTH` (`@cocooning/couple-shared-kernel/limits`).
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R3. Un événement est partagé à sa création

Mon nouvel événement est tout de suite visible et modifiable par mon âme sœur, sauf si je coche « rien que pour moi ».

- Dans le code : `CalendarEvent.create`, visibilité `SHARED`, ou `PRIVATE` reçue à la création.
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R4. Les événements demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas d'agenda.

- Dans le code : `AgendaCoupleGuardService` et `PairedCoupleProvider` (décision 0041), refus `CALENDAR_EVENT_COUPLE_NOT_PAIRED`.
- Source : décision 0046, [décision 0041](../../decisions/0041-couple-de-la-requete.md). Validée par : Thomas De Sousa, 2026-11-24.

## Le moment

### R5. Un jour, et le reste est facultatif

Un événement commence un jour. Je peux ajouter un dernier jour (« jusqu'au ») pour un week-end ou un voyage : il vient après le premier. Sans heure, l'événement dure toute la journée ; je peux ajouter une heure de début, puis une heure de fin, qui vient après le début quand l'événement tient en un jour. Les heures sont celles de Paris.

- Dans le code : `CalendarEventMoment.create`, jours et heures de Paris gardés tels quels ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)).
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R6. Une description facultative

J'ajoute si je veux quelques lignes de texte simple sous l'événement, 2 000 signes au plus.

- Dans le code : `CalendarEventDescription.create`, `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` (`@cocooning/couple-shared-kernel/limits`).
- Source : décision 0046 ; la limite de 2 000 signes, proposée par Claude, est acceptée par le propriétaire (« go », 2026-11-24). Validée par : Thomas De Sousa, 2026-11-24.

## Visibilité

### R7. Un événement « rien que pour moi » n'existe que pour son auteur

Mon événement privé n'apparaît pas chez l'autre, ni dans la liste ni par un point sur le calendrier, et l'app ne lui dit même pas qu'il existe.

- Dans le code : `CalendarEventRepository.findVisibleById` et `findVisibleOverlapping` filtrent par la requête ; `CalendarEventPreconditionService.loadVisibleCalendarEvent` refuse `CALENDAR_EVENT_NOT_FOUND` (`core.md` règle 27). La PWA dessine les points des seuls événements que l'API lui rend (`presentDayMarks`).
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R8. Seul l'auteur change la visibilité

Je rends privé ou je partage mon événement ; l'autre ne peut pas cacher mon événement à moi-même.

- Dans le code : `ShareCalendarEventUseCase`, `MakeCalendarEventPrivateUseCase`, `CalendarEventAccessValidator.ensureOwner` (`CALENDAR_EVENT_RESERVED_TO_OWNER`).
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

## Modification et suppression

### R9. Les deux modifient et suppriment un événement partagé

Nous modifions ou supprimons tous les deux n'importe quel événement partagé ; il disparaît pour nous deux. Un événement privé ne se modifie et ne se supprime que par son auteur, le seul à le voir.

- Dans le code : `EditCalendarEventUseCase`, `DeleteCalendarEventUseCase`, `CalendarEvent.edit`, `CalendarEvent.delete` (suppression douce, `core-backend.md` règle 13) ; un événement privé n'est chargé que pour son auteur (R7).
- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

## Notification

### R10. Un événement qui devient visible pour l'autre le notifie

Je crée un événement partagé, ou je partage un événement privé : le téléphone de l'autre affiche « Ton âme sœur a ajouté un événement », sans le titre. Un événement « rien que pour moi » ne notifie personne.

- Dans le code : le relais de l'outbox du contexte `messaging` lit `agenda_event` ; `pushNotificationsOf` (`messaging/domain/models/push-notification-plan.ts`) fait d'un `CalendarEventCreatedEvent` de visibilité `SHARED` ou d'un `CalendarEventSharedEvent` un `CALENDAR_EVENT_ADDED` pour l'autre partenaire seulement ; un événement créé `PRIVATE` ne notifie personne ([décision 0051](../../decisions/messaging/0051-relais-des-notifications.md)).
- Source : [décision 0050](../../decisions/messaging/0050-regles-des-messages.md). Validée par : Thomas De Sousa, 2026-11-24.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Lire, modifier ou supprimer l'événement privé de l'autre | Refusé, `404` `CALENDAR_EVENT_NOT_FOUND`, comme un événement inexistant (R7) |
| Changer la visibilité de l'événement partagé de l'autre | Refusé, `403` `CALENDAR_EVENT_RESERVED_TO_OWNER` (R8) |
| Toute action sur l'agenda sans couple formé | Refusée, `404` `CALENDAR_EVENT_COUPLE_NOT_PAIRED` (R4, décision 0041) |
| Événement inconnu ou supprimé | Refusé, `404` `CALENDAR_EVENT_NOT_FOUND` (R7) |
| Deux écritures du même événement en même temps | Refusée, `409` `CALENDAR_EVENT_VERSION_CONFLICT` |
| Titre vide ou trop long, description trop longue | Refusé, `422` `CALENDAR_EVENT_TITLE_INVALID` ou `CALENDAR_EVENT_DESCRIPTION_INVALID` (R2, R6) |
| Dernier jour avant le premier, heure de fin avant l'heure de début le même jour, heure de fin sans heure de début | Refusé, `422` `CALENDAR_EVENT_MOMENT_INVALID` (R5) |

## Voir aussi

- [Glossaire de l'agenda](glossary.md)
