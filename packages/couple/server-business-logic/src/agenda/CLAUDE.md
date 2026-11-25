# Agenda

L'agenda partage du couple : des evenements d'agenda (`CalendarEvent`) avec un titre, une description facultative, un moment (jour, dernier jour, heures de Paris), un auteur, une visibilite (partage ou rien que pour moi) et pour qui il est (`audience`, relatif a l'auteur, R11).

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/agenda/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/agenda/rules.md

Architecture :
@../../../../../docs/couple/architecture/agenda/index.md

## Consignes de code

- Les use cases recoivent l'`ExecutionContext` complet, construit par l'API avec `AgendaCoupleGuardService` (decision 0041) ; aucun use case ne lit le couple lui-meme.
- La visibilite se filtre dans la requete (`findVisibleById`, `findVisibleOverlapping`), jamais en memoire apres chargement : l'evenement prive de l'autre repond `CALENDAR_EVENT_NOT_FOUND` comme un evenement inexistant (R7). Modifier et supprimer ne verifient donc pas l'auteur (R9) ; seule la visibilite le verifie (R8).
- Jours `YYYY-MM-DD` et heures `HH:MM` restent des chaines a l'heure de Paris, jamais des instants (decision 0047) : ils se comparent comme des chaines.
- `audience` voyage dans les details (`createCalendarEventDetails`) ; l'agregat verifie seul qu'un evenement prive est `OWNER` (`CalendarEventAudienceValidator`), a la creation, a la modification et pour rendre prive.
- Le titre, la description et les jours appartiennent au couple : jamais dans un evenement ni dans un log (`core.md` regle 33).

## Tests

- `givenEventOf(context, details)` et `givenPrivateEventOf(context, details)` (`__tests__/fixtures/agenda-test.fakes.ts`) posent un evenement sans evenement de domaine, `DINNER` par defaut (`audience` `BOTH`, `OWNER` pour l'evenement prive) ; `WEEKEND` (`agenda-test.data.ts`) couvre un evenement de plusieurs jours sans heure. `AS_A`, `AS_B` (le couple) et `AS_STRANGER` (un autre couple) sont les contextes des specs.
- Les cas de R5 (ordre des jours et des heures) sont dans `domain/value-objects/calendar-event-moment.vo.spec.ts` ; le chevauchement d'une plage de jours dans `list-calendar-events.use-case.spec.ts`.
