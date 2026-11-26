# Agenda

L'agenda partage du couple depuis la PWA : lister les evenements d'une plage de jours, ouvrir, creer, modifier, partager, rendre prive, supprimer ; lister, creer, modifier et supprimer les etiquettes du couple (decision 0056).

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
- `createCalendarEventFormSchema(t)` suit R2, R5, R6, R11 comme l'API : titre coupe de 1 a `CALENDAR_EVENT_TITLE_MAX_LENGTH`, description coupee d'au plus `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH`, jour obligatoire, `endsOn` apres `startsOn`, `endsAt` seulement avec `startsAt` et apres lui sur un seul jour. Un champ facultatif vide devient `null`. `audience` est le pour qui vu par qui remplit le formulaire (`ViewerAudienceEnum`), obligatoire ; `labelId` l'etiquette (R13) ou `null`. Un evenement « rien que pour moi » est pour moi (`checkCalendarEventAudience`, R11). Cles `form.title.errors.{required,tooLong}`, `form.description.errors.tooLong`, `form.moment.errors.{startsOnRequired,dayInvalid,hourInvalid,endsOnNotAfterStartsOn,endsAtWithoutStartsAt,endsAtNotAfterStartsAt}`, `form.audience.errors.{required,privateNotForMe}` (decision 0031), chacune sur le chemin du champ fautif.
- `isPrivate` du formulaire devient la visibilite a la creation (R3, `toCreateCalendarEventRequest`) ; la modification envoie tout le detail sans visibilite (`toEditCalendarEventRequest`), qui ne change que par partager ou rendre prive (R8).
- Pour qui (R11) : l'API le garde relatif a l'auteur (`CalendarEventAudienceEnum`), l'ecran le montre et le fait choisir relatif a qui regarde (`ViewerAudienceEnum` `ME`, `YOU`, `BOTH`, `domain/enums/`). `toViewerAudience(audience, isOwner)` et `toEventAudience(viewerAudience, isOwner)` (`domain/models/viewer-audience.ts`) passent de l'un a l'autre. Jamais une valeur vue par qui regarde vers l'API : `toCreateCalendarEventRequest` convertit pour l'auteur, `toEditCalendarEventRequest(form, isOwner)` et `EditCalendarEventUseCase.execute(calendarEventId, form, isOwner)` pour qui modifie (l'autre partenaire qui choisit « Moi » envoie `PARTNER`). `labelId` part tel quel (R13).
- Etiquettes (R12 a R14) : port `CalendarLabelsGateway` (`list`, `create`, `edit`, `delete`), meme regle qu'`AgendaGateway` : aucune methode ne prend de `coupleId` ni de `userId`. `ListCalendarLabelsUseCase`, `CreateCalendarLabelUseCase`, `EditCalendarLabelUseCase` (nom et couleur ensemble), `DeleteCalendarLabelUseCase` envoient le formulaire tel quel : `CalendarLabelForm` a la forme de la requete du contrat. `createCalendarLabelFormSchema(t)` : nom coupe de 1 a `CALENDAR_LABEL_NAME_MAX_LENGTH`, couleur de `CalendarLabelColorEnum`, cles `form.labelName.errors.{required,tooLong}`, `form.labelColor.errors.required`. La 21e etiquette arrive en `CONFLICT` (`CALENDAR_LABEL_LIMIT_REACHED`), une etiquette inconnue en `NOT_FOUND` (`CALENDAR_LABEL_NOT_FOUND`), sur un evenement comme sur l'etiquette.
- La plage de `ListCalendarEventsUseCase` (`from`, `to`, au plus `CALENDAR_EVENT_RANGE_MAX_DAYS` jours) est verifiee par l'API : `VALIDATION_ERROR` (`CALENDAR_EVENT_RANGE_INVALID`).
- Changer la visibilite de l'evenement de l'autre arrive en `FORBIDDEN` (`CALENDAR_EVENT_RESERVED_TO_OWNER`) ; l'evenement prive de l'autre, ou un couple pas encore forme, en `NOT_FOUND` (R4, R7).

## Tests

- `FakeAgendaGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenRefusal(error)` (vaut pour tous les appels), `A_SHARED_CALENDAR_EVENT`, `A_PRIVATE_CALENDAR_EVENT`, `A_CALENDAR_EVENT_LIST`. `FakeCalendarLabelsGateway`, meme forme : `calls`, `givenRefusal(error)`, `A_CALENDAR_LABEL`, `A_CALENDAR_LABEL_LIST`.
