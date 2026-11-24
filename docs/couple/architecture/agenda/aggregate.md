# Agrégat CalendarEvent

Cette page décrit l'agrégat `CalendarEvent` du contexte `agenda` : son état, ses transitions et les invariants qu'il garantit. À lire avant de toucher à `calendar-event.aggregate.ts`.

## Rôle et limites

`CalendarEvent` porte un événement d'agenda : son couple, son auteur, ses détails (titre, description, moment) et sa visibilité. L'agrégat ne sait pas qui le regarde : la visibilité se filtre dans la requête du repository, si bien que modifier et supprimer n'ont pas à vérifier l'auteur (R9).

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `CalendarEvent.create(input, now)` | L'auteur devient propriétaire ; visibilité `SHARED`, ou `PRIVATE` quand il coche « rien que pour moi » ; enregistre `CalendarEventCreatedEvent` (R1, R3) | `domain/models/calendar-event.aggregate.ts` |
| `CalendarEvent.edit(userId, details, now)` | Remplace les détails ; enregistre `CalendarEventEditedEvent` (R9) | idem |
| `CalendarEvent.share(userId, now)`, `CalendarEvent.makePrivate(userId, now)` | Change la visibilité, auteur seul ; enregistre `CalendarEventSharedEvent` ou `CalendarEventMadePrivateEvent` (R8) | idem |
| `CalendarEvent.delete(userId, now)` | Suppression douce ; enregistre `CalendarEventDeletedEvent` (R9) | idem |
| `CalendarEvent.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO, par `calendarEventPropsFromSnapshot` et `calendarEventSnapshotFromProps` | idem, `domain/models/calendar-event.aggregate.snapshot.ts` |
| `CalendarEventMoment.create` | `startsOn` vrai jour ; `endsOn` vrai jour après `startsOn` ; `startsAt`, `endsAt` heures `HH:MM` ; `endsAt` seulement avec `startsAt`, et après lui sans `endsOn` (R5) | `domain/value-objects/calendar-event-moment.vo.ts` |
| `CalendarEventAccessValidator.ensureOwner` | Refuse `CALENDAR_EVENT_RESERVED_TO_OWNER` | `domain/services/calendar-event-access.validator.ts` |

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `CalendarEventCreatedEvent` | `agenda.calendar-event.created` | `ownerId`, `visibility` |
| `CalendarEventEditedEvent` | `agenda.calendar-event.edited` | aucune (`null`) |
| `CalendarEventSharedEvent` | `agenda.calendar-event.shared` | aucune (`null`) |
| `CalendarEventMadePrivateEvent` | `agenda.calendar-event.made-private` | aucune (`null`) |
| `CalendarEventDeletedEvent` | `agenda.calendar-event.deleted` | aucune (`null`) |

Chaque événement porte l'`ExecutionContext` complet ; aucun ne porte le titre, la description ni les jours.

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Un événement a un titre de 1 à `CALENDAR_EVENT_TITLE_MAX_LENGTH` signes, sans espaces autour (`CALENDAR_EVENT_TITLE_INVALID`, R2) | `CalendarEventTitle.create` |
| INV-002 | Une description fait au plus `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` signes sans espaces autour ; vide, elle est absente (`CALENDAR_EVENT_DESCRIPTION_INVALID`, R6) | `CalendarEventDescription.create` |
| INV-003 | Le dernier jour vient après le premier ; une heure de fin demande une heure de début, et vient après elle sur un seul jour (`CALENDAR_EVENT_MOMENT_INVALID`, R5) | `CalendarEventMoment.create` |
| INV-004 | Seul l'auteur change la visibilité (`CALENDAR_EVENT_RESERVED_TO_OWNER`, R8) | agrégat (`ensureOwner`) |
| INV-005 | L'auteur et le couple d'un événement ne changent jamais | agrégat (propriétés `readonly`) |
| INV-006 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |

## Décisions liées

- [Décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md) : règles de l'agenda
- [Décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md) : jours et heures de Paris, sans instant
