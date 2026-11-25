# Agrégats CalendarEvent et CalendarLabel

Cette page décrit les agrégats `CalendarEvent` et `CalendarLabel` du contexte `agenda` : leur état, leurs transitions et les invariants qu'ils garantissent. À lire avant de toucher à `calendar-event.aggregate.ts` ou `calendar-label.aggregate.ts`.

## Rôle et limites

`CalendarEvent` porte un événement d'agenda : son couple, son auteur, ses détails (titre, description, moment, pour qui) et sa visibilité. L'agrégat ne sait pas qui le regarde : la visibilité se filtre dans la requête du repository, si bien que modifier et supprimer n'ont pas à vérifier l'auteur (R9).

`CalendarLabel` porte une étiquette commune au couple : un nom, une couleur parmi huit, le partenaire qui l'a créée (R12). Les deux partenaires la modifient et la suppriment ; aucune visibilité ne la cache.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `CalendarEvent.create(input, now)` | L'auteur devient propriétaire ; visibilité `SHARED`, ou `PRIVATE` quand il coche « rien que pour moi » ; refuse un événement privé qui n'est pas pour son auteur ; enregistre `CalendarEventCreatedEvent` (R1, R3, R11) | `domain/models/calendar-event.aggregate.ts` |
| `CalendarEvent.edit(userId, details, now)` | Remplace les détails ; un événement privé reste pour son auteur ; enregistre `CalendarEventEditedEvent` (R9, R11) | idem |
| `CalendarEvent.share(userId, now)`, `CalendarEvent.makePrivate(userId, now)` | Change la visibilité, auteur seul ; partager garde l'`audience`, rendre privé demande `OWNER` ; enregistre `CalendarEventSharedEvent` ou `CalendarEventMadePrivateEvent` (R8, R11) | idem |
| `CalendarEvent.delete(userId, now)` | Suppression douce ; enregistre `CalendarEventDeletedEvent` (R9) | idem |
| `CalendarEvent.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO, par `calendarEventPropsFromSnapshot` et `calendarEventSnapshotFromProps` | idem, `domain/models/calendar-event.aggregate.snapshot.ts` |
| `CalendarEventMoment.create` | `startsOn` vrai jour ; `endsOn` vrai jour après `startsOn` ; `startsAt`, `endsAt` heures `HH:MM` ; `endsAt` seulement avec `startsAt`, et après lui sans `endsOn` (R5) | `domain/value-objects/calendar-event-moment.vo.ts` |
| `CalendarEventAccessValidator.ensureOwner` | Refuse `CALENDAR_EVENT_RESERVED_TO_OWNER` | `domain/services/calendar-event-access.validator.ts` |
| `CalendarLabel.create(input, now)` | Une étiquette du couple, au nom de 1 à `CALENDAR_LABEL_NAME_MAX_LENGTH` signes ; enregistre `CalendarLabelCreatedEvent` (R12) | `domain/models/calendar-label.aggregate.ts` |
| `CalendarLabel.edit(userId, name, color, now)` | Renomme et recolore d'un coup ; enregistre `CalendarLabelEditedEvent` (R12) | idem |
| `CalendarLabel.delete(userId, now)` | Suppression douce ; enregistre `CalendarLabelDeletedEvent` (R14) | idem |
| `CalendarLabelPreconditionService` | `loadCalendarLabel` (sinon `CALENDAR_LABEL_NOT_FOUND`, R13), `ensureLabelRoomLeft` (au plus `CALENDAR_LABEL_MAX_COUNT` étiquettes vivantes, sinon `CALENDAR_LABEL_LIMIT_REACHED`, R12) | `domain/services/calendar-label-precondition.service.ts` |
| `CalendarEventAudienceValidator.ensureFits` | Refuse `CALENDAR_EVENT_AUDIENCE_INVALID` pour un événement privé qui n'est pas `OWNER` | `domain/services/calendar-event-audience.validator.ts` |

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `CalendarEventCreatedEvent` | `agenda.calendar-event.created` | `ownerId`, `visibility` |
| `CalendarEventEditedEvent` | `agenda.calendar-event.edited` | aucune (`null`) |
| `CalendarEventSharedEvent` | `agenda.calendar-event.shared` | aucune (`null`) |
| `CalendarEventMadePrivateEvent` | `agenda.calendar-event.made-private` | aucune (`null`) |
| `CalendarEventDeletedEvent` | `agenda.calendar-event.deleted` | aucune (`null`) |
| `CalendarLabelCreatedEvent` | `agenda.calendar-label.created` | `ownerId`, `color` |
| `CalendarLabelEditedEvent` | `agenda.calendar-label.edited` | `color` |
| `CalendarLabelDeletedEvent` | `agenda.calendar-label.deleted` | aucune (`null`) |

Chaque événement porte l'`ExecutionContext` complet ; aucun ne porte le titre, la description, les jours ni le nom d'une étiquette.

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Un événement a un titre de 1 à `CALENDAR_EVENT_TITLE_MAX_LENGTH` signes, sans espaces autour (`CALENDAR_EVENT_TITLE_INVALID`, R2) | `CalendarEventTitle.create` |
| INV-002 | Une description fait au plus `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` signes sans espaces autour ; vide, elle est absente (`CALENDAR_EVENT_DESCRIPTION_INVALID`, R6) | `CalendarEventDescription.create` |
| INV-003 | Le dernier jour vient après le premier ; une heure de fin demande une heure de début, et vient après elle sur un seul jour (`CALENDAR_EVENT_MOMENT_INVALID`, R5) | `CalendarEventMoment.create` |
| INV-004 | Seul l'auteur change la visibilité (`CALENDAR_EVENT_RESERVED_TO_OWNER`, R8) | agrégat (`ensureOwner`) |
| INV-005 | L'auteur et le couple d'un événement ne changent jamais | agrégat (propriétés `readonly`) |
| INV-006 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |
| INV-007 | Un événement privé est pour son auteur : `audience` vaut `OWNER` à la création, à la modification et pour être rendu privé (`CALENDAR_EVENT_AUDIENCE_INVALID`, R11) | agrégat (`CalendarEventAudienceValidator.ensureFits`) |
| INV-008 | Une étiquette a un nom de 1 à `CALENDAR_LABEL_NAME_MAX_LENGTH` signes sans espaces autour (`CALENDAR_LABEL_NAME_INVALID`) et une couleur de `CalendarLabelColorEnum` (R12) | `CalendarLabelName.create`, contrat |
| INV-009 | Un couple a au plus `CALENDAR_LABEL_MAX_COUNT` étiquettes vivantes (`CALENDAR_LABEL_LIMIT_REACHED`, R12) ; deux créations au même instant peuvent dépasser la borne, sans verrou : limite connue, acceptée | `CalendarLabelPreconditionService.ensureLabelRoomLeft` |

## Décisions liées

- [Décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md) : règles de l'agenda
- [Décision 0056](../../decisions/agenda/0056-pour-qui-et-etiquettes.md) : pour qui est un événement, et des étiquettes de couleur
- [Décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md) : jours et heures de Paris, sans instant
