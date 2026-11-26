# Agenda

Cette page décrit comment le contexte `agenda` est construit : ses couches, ses use cases et la façon dont il trouve le couple de la requête. À lire avant de modifier `packages/couple/server-business-logic/src/agenda/`.

## Rôle et limites

`agenda` porte les événements d'agenda du couple et ses étiquettes de couleur : leur titre, leur description, leur moment, leur auteur, leur visibilité, pour qui ils sont et leur cycle de vie ([décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md), [décision 0056](../../decisions/agenda/0056-pour-qui-et-etiquettes.md)). Les jours et les heures sont des heures de Paris, gardées telles quelles ([décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md)). Le contexte ne connaît ni les sessions (`authentication`) ni le créateur du couple (`pairing`) : il reçoit le `coupleId` par un port étroit ([décision 0041](../../decisions/0041-couple-de-la-requete.md)), et la PWA colore un événement par son étiquette, neutre sans étiquette (R13).

Construit aujourd'hui : domaine et application, tables `calendar_event`, `calendar_label` et `agenda_event` (voir [les tables](tables.md)), adaptateurs Prisma de `CalendarEventRepository`, de `CalendarLabelRepository` et de `PairedCoupleProvider`, contrat HTTP et onze routes de l'API, lecture de l'agenda dans la PWA (grille du mois et jour choisi, [décision 0048](../../decisions/frontend/0048-calendrier-react-day-picker.md)), et ses écritures dans une feuille qui monte du bas : ajouter, modifier, partager, rendre privé, supprimer (voir [l'architecture front](../frontend/index.md)).

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `CalendarEvent` | Agrégat : titre, description, moment, auteur, visibilité (voir [l'agrégat](aggregate.md)) | `domain/models/calendar-event.aggregate.ts` |
| `CalendarLabel` | Agrégat : étiquette commune au couple, nom et couleur (R12, voir [les agrégats](aggregate.md)) | `domain/models/calendar-label.aggregate.ts` |
| `CalendarLabelId`, `CalendarLabelName` | Value objects : identité UUID v7, nom de 1 à `CALENDAR_LABEL_NAME_MAX_LENGTH` signes (R12) | `domain/value-objects/` |
| `CalendarLabelColorEnum` | Les huit couleurs d'une étiquette, partagé avec la PWA | `packages/couple/shared-kernel/src/enums/calendar-label-color.enum.ts` |
| `CalendarLabelRepository` | Port : `save`, `findById`, `findAll` (dans l'ordre de création), `countLive` ; tous par `coupleId`, étiquettes vivantes seulement | `domain/ports/calendar-label.repository.ts` |
| `CalendarLabelPreconditionService` | Domain service : l'étiquette du couple, sinon `CALENDAR_LABEL_NOT_FOUND` (R13) ; `ensureLabelUsable` laisse passer `null` ou une étiquette vivante du couple, à la création et à la modification d'un événement ; la place pour une de plus, sinon `CALENDAR_LABEL_LIMIT_REACHED` (R12) | `domain/services/calendar-label-precondition.service.ts` |
| `ListCalendarLabelsUseCase`, `CreateCalendarLabelUseCase`, `EditCalendarLabelUseCase`, `DeleteCalendarLabelUseCase` | Use cases des étiquettes, `execute(context, command)` | `application/use-cases/` |
| `toCalendarLabelView` | Vue d'une étiquette : identifiant, nom, couleur, dernière modification | `application/mappers/calendar-label-view.mapper.ts` |
| `CalendarEventId`, `CalendarEventTitle`, `CalendarEventDescription`, `CalendarEventMoment` | Value objects : identité UUID v7, titre de 1 à `CALENDAR_EVENT_TITLE_MAX_LENGTH` signes (R2), description d'au plus `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` signes (R6), moment (R5) | `domain/value-objects/` |
| `createCalendarEventDetails` | Valide d'un coup le titre, la description et le moment saisis, à la création comme à la modification, et y joint pour qui est l'événement (R11) et son étiquette (`labelId`, R13) | `domain/value-objects/calendar-event-details.ts` |
| `CalendarEventVisibilityEnum` | `PRIVATE`, `SHARED`, partagé avec la PWA | `packages/couple/shared-kernel/src/enums/calendar-event-visibility.enum.ts` |
| `CalendarEventAudienceEnum` | `OWNER`, `PARTNER`, `BOTH`, pour qui est l'événement, relatif à l'auteur (R11), partagé avec la PWA | `packages/couple/shared-kernel/src/enums/calendar-event-audience.enum.ts` |
| `AgendaException` | Exception du contexte, codes `CALENDAR_EVENT_*` de `AgendaExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/agenda/exceptions/exception-codes.ts` |
| `CalendarEventRepository` | Port : `save`, `findVisibleById`, `findVisibleOverlapping` (les événements qui touchent un jour de la plage, dans l'ordre des jours), `clearLabel` (retire une étiquette des événements du couple, R14) ; la visibilité est filtrée par la requête (R7) | `domain/ports/calendar-event.repository.ts` |
| `PairedCoupleProvider` | Port : le couple formé d'un partenaire, seule recherche sans `coupleId` du contexte (décision 0041) | `domain/ports/paired-couple.provider.ts` |
| `CalendarEventPreconditionService` | Domain service : l'événement visible pour le partenaire, sinon `CALENDAR_EVENT_NOT_FOUND` | `domain/services/calendar-event-precondition.service.ts` |
| `CalendarEventAccessValidator` | Contrôle statique : visibilité réservée à l'auteur (R8) | `domain/services/calendar-event-access.validator.ts` |
| `CalendarEventAudienceValidator` | Contrôle statique : un événement privé est pour son auteur, sinon `CALENDAR_EVENT_AUDIENCE_INVALID` (R11) | `domain/services/calendar-event-audience.validator.ts` |
| `CalendarEventRangeValidator` | Contrôle statique : deux vrais jours dans l'ordre, au plus `CALENDAR_EVENT_RANGE_MAX_DAYS` jours, sinon `CALENDAR_EVENT_RANGE_INVALID` | `domain/services/calendar-event-range.validator.ts` |
| `AgendaCoupleGuardService` | Guard service : construit l'`ExecutionContext` depuis le `PartnerContext`, sinon `CALENDAR_EVENT_COUPLE_NOT_PAIRED` (R4, décision 0006) | `application/services/agenda-couple-guard.service.ts` |
| `CreateCalendarEventUseCase`, `ListCalendarEventsUseCase`, `GetCalendarEventUseCase`, `EditCalendarEventUseCase`, `ShareCalendarEventUseCase`, `MakeCalendarEventPrivateUseCase`, `DeleteCalendarEventUseCase` | Use cases, `execute(context, command)` | `application/use-cases/` |
| `CalendarEventPrismaRepository`, `CalendarLabelPrismaRepository`, `PairedCouplePrismaProvider` | Adaptateurs : événement et outbox dans une transaction, verrou optimiste, visibilité et plage de jours dans le `where` ; lecture seule du couple formé dans les tables de `pairing` | `apps/couple/api/src/modules/agenda/secondary/` |
| `toCalendarEventView` | Vue rendue pour le partenaire qui lit : identifiant, auteur (`ownerId`), `isOwner` (pour les actions de R8), titre, description, moment, visibilité, pour qui (`audience`, relatif à l'auteur : la PWA le tourne pour qui lit), dernière modification | `application/mappers/calendar-event-view.mapper.ts` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/agenda/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0034](../../decisions/0034-session-revocable.md)), puis un couple formé : le garde `AgendaCoupleGuard` (`apps/couple/api/src/modules/agenda/primary/couple/`) pose l'`ExecutionContext` que `@CurrentCouple()` donne au contrôleur. Sans session `401`, sans couple formé `404` `CALENDAR_EVENT_COUPLE_NOT_PAIRED`. Le corps d'une réponse suit `CalendarEventResponseSchema` : `calendarEventId`, `ownerId`, `isOwner`, `title`, `description`, `startsOn`, `endsOn`, `startsAt`, `endsAt`, `visibility`, `audience`, `labelId` (ou `null`), `updatedAt` (instant ISO).

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `POST /calendar-events`, corps `CreateCalendarEventRequestSchema` | `CALENDAR_EVENT_CREATE` | `CreateCalendarEventUseCase` | `201` | `422` détail invalide (R2, R5, R6), `CALENDAR_EVENT_AUDIENCE_INVALID` pour un événement privé qui n'est pas pour son auteur (R11) ; `404` `CALENDAR_LABEL_NOT_FOUND` (R13) |
| `GET /calendar-events?from&to` | `CALENDAR_EVENT_LIST` | `ListCalendarEventsUseCase` | `200`, `CalendarEventListResponseSchema` (`items`) | `422` `CALENDAR_EVENT_RANGE_INVALID` |
| `GET /calendar-events/:calendarEventId` | `CALENDAR_EVENT_GET` | `GetCalendarEventUseCase` | `200` | `404` `CALENDAR_EVENT_NOT_FOUND` (R7) ; `422` identifiant invalide |
| `PATCH /calendar-events/:calendarEventId`, corps `EditCalendarEventRequestSchema` | `CALENDAR_EVENT_EDIT` | `EditCalendarEventUseCase` | `200` | `404` ; `409` `CALENDAR_EVENT_VERSION_CONFLICT` ; `422`, dont `CALENDAR_EVENT_AUDIENCE_INVALID` (R11) ; `404` `CALENDAR_LABEL_NOT_FOUND` (R13) |
| `POST /calendar-events/:calendarEventId/share` | `CALENDAR_EVENT_SHARE` | `ShareCalendarEventUseCase` | `200` | `403` `CALENDAR_EVENT_RESERVED_TO_OWNER` (R8) ; `404` |
| `POST /calendar-events/:calendarEventId/make-private` | `CALENDAR_EVENT_MAKE_PRIVATE` | `MakeCalendarEventPrivateUseCase` | `200` | `403` ; `404` ; `422` `CALENDAR_EVENT_AUDIENCE_INVALID` pour un événement qui n'est pas pour son auteur seul (R11) |
| `DELETE /calendar-events/:calendarEventId` | `CALENDAR_EVENT_DELETE` | `DeleteCalendarEventUseCase` | `204` | `404` |
| `GET /calendar-labels` | `CALENDAR_LABEL_LIST` | `ListCalendarLabelsUseCase` | `200`, `CalendarLabelListResponseSchema` (`items`, ordre de création) | aucun |
| `POST /calendar-labels`, corps `CreateCalendarLabelRequestSchema` | `CALENDAR_LABEL_CREATE` | `CreateCalendarLabelUseCase` | `201` | `409` `CALENDAR_LABEL_LIMIT_REACHED` ; `422` nom ou couleur invalides |
| `PATCH /calendar-labels/:calendarLabelId`, corps `EditCalendarLabelRequestSchema` | `CALENDAR_LABEL_EDIT` | `EditCalendarLabelUseCase` | `200` | `404` `CALENDAR_LABEL_NOT_FOUND` ; `409` `CALENDAR_LABEL_VERSION_CONFLICT` ; `422` |
| `DELETE /calendar-labels/:calendarLabelId` | `CALENDAR_LABEL_DELETE` | `DeleteCalendarLabelUseCase` : l'étiquette et ses événements dans une transaction (R14) | `204` | `404` |

Une étiquette répond `CalendarLabelResponseSchema` : `calendarLabelId`, `name`, `color`, `updatedAt` (instant ISO).

## Points d'attention

- **Couple de la requête.** Les use cases reçoivent un `ExecutionContext` complet. L'API le construit par `AgendaCoupleGuardService` avant d'appeler un use case ; sans couple formé, `CALENDAR_EVENT_COUPLE_NOT_PAIRED`.
- **Visibilité dans la requête.** `findVisibleById` et `findVisibleOverlapping` ne rendent que les événements vivants du couple, partagés ou à ce partenaire (`core-backend.md` règle 12) : l'événement privé de l'autre répond `CALENDAR_EVENT_NOT_FOUND`, comme un événement inexistant (R7). Modifier et supprimer passent par cette lecture : les deux partenaires agissent sur un événement partagé, l'auteur seul sur son événement privé (R9).
- **Plage de jours.** La liste lit les événements de `from` à `to` inclus : un événement la touche quand `startsOn <= to` et que son dernier jour (`endsOn`, ou `startsOn` sans dernier jour) est `>= from`. Une plage dépasse rarement six semaines (la grille d'un mois) ; `CALENDAR_EVENT_RANGE_MAX_DAYS` (62) borne la lecture sans pagination.
- **Modifier, c'est tout renvoyer.** `EditCalendarEventUseCase` reçoit tous les détails (titre, description, moment, pour qui) et les valide ensemble, comme à la création : le formulaire les montre et les renvoie tous.
- **Pour qui, relatif à l'auteur.** `audience` dit `OWNER` (l'auteur), `PARTNER` (l'autre) ou `BOTH` ; la PWA l'affiche « Moi », « Toi » ou « Nous deux » selon qui lit. Partager garde l'`audience` ; rendre privé un événement qui n'est pas `OWNER` est refusé (R11). Les événements d'avant la décision 0056 sont devenus `BOTH` s'ils étaient partagés, `OWNER` s'ils étaient privés (migration `20261125230000_agenda_calendar_event_audience`).
- **Étiquettes communes.** Les étiquettes n'ont pas de visibilité : les deux partenaires les lisent, les modifient et les suppriment ; un autre couple reçoit `CALENDAR_LABEL_NOT_FOUND`. Au plus `CALENDAR_LABEL_MAX_COUNT` (20) étiquettes vivantes par couple : le compte précède la création sans verrou, si bien que deux créations au même instant peuvent en faire 21, limite connue et acceptée (deux utilisateurs).
- **Supprimer une étiquette garde ses événements.** `DeleteCalendarLabelUseCase` enregistre la suppression douce puis `CalendarEventRepository.clearLabel` dans une même unité de travail : un seul `updateMany` met `label_id` à `null` sur les événements du couple qui la portaient, privés compris, sans changer leur `version` ni écrire d'événement de domaine (R14).
- **Le contenu appartient au couple.** Aucun événement de domaine ne porte le titre, la description, les jours ni le nom d'une étiquette (`core.md` règle 33).

## Décisions liées

- [Décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md) : règles de l'agenda
- [Décision 0056](../../decisions/agenda/0056-pour-qui-et-etiquettes.md) : pour qui est un événement, et des étiquettes de couleur
- [Décision 0047](../../decisions/agenda/0047-moments-de-l-agenda-en-heure-de-paris.md) : jours et heures de Paris, sans instant
- [Décision 0041](../../decisions/0041-couple-de-la-requete.md) : le couple de la requête vient de `pairing`
- [Décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md) : portée par couple et propriétaire
