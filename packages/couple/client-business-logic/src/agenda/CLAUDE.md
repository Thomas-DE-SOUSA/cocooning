# Agenda

L'agenda partage du couple depuis la PWA : lister les evenements d'une plage de jours, ouvrir, creer, modifier, partager, rendre prive, supprimer.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/agenda/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/agenda/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `AgendaGateway` agit toujours pour le partenaire connecte : son adaptateur renvoie la session a l'API (decision 0036), l'API trouve le couple (decision 0041). Aucune methode ne prend de `coupleId` ni de `userId`.
- Jours `YYYY-MM-DD` et heures `HH:MM` de Paris, en chaines, jamais en `Date` (decision 0047). Un jour se verifie par `isCalendarDay` (`@cocooning/shared-kernel/utils`), une heure par `z.iso.time({ precision: -1 })` comme le contrat.
- `createCalendarEventFormSchema(t)` suit R2, R5, R6 comme l'API : titre coupe de 1 a `CALENDAR_EVENT_TITLE_MAX_LENGTH`, description coupee d'au plus `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH`, jour obligatoire, `endsOn` apres `startsOn`, `endsAt` seulement avec `startsAt` et apres lui sur un seul jour. Un champ facultatif vide devient `null`. Cles `form.title.errors.{required,tooLong}`, `form.description.errors.tooLong`, `form.moment.errors.{startsOnRequired,dayInvalid,hourInvalid,endsOnNotAfterStartsOn,endsAtWithoutStartsAt,endsAtNotAfterStartsAt}` (decision 0031), chacune sur le chemin du champ fautif.
- `isPrivate` du formulaire devient la visibilite a la creation (R3, `toCreateCalendarEventRequest`) ; la modification envoie tout le detail sans visibilite (`toEditCalendarEventRequest`), qui ne change que par partager ou rendre prive (R8).
- Tant que le formulaire ne demande pas pour qui est l'evenement (R11), `audience` se deduit de `isPrivate` : `OWNER` pour un evenement prive, `BOTH` sinon, a la creation comme a la modification.
- La plage de `ListCalendarEventsUseCase` (`from`, `to`, au plus `CALENDAR_EVENT_RANGE_MAX_DAYS` jours) est verifiee par l'API : `VALIDATION_ERROR` (`CALENDAR_EVENT_RANGE_INVALID`).
- Changer la visibilite de l'evenement de l'autre arrive en `FORBIDDEN` (`CALENDAR_EVENT_RESERVED_TO_OWNER`) ; l'evenement prive de l'autre, ou un couple pas encore forme, en `NOT_FOUND` (R4, R7).

## Tests

- `FakeAgendaGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenRefusal(error)` (vaut pour tous les appels), `A_SHARED_CALENDAR_EVENT`, `A_PRIVATE_CALENDAR_EVENT`, `A_CALENDAR_EVENT_LIST`.
