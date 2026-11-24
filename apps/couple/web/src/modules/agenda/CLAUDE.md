# Agenda

Le partenaire parcourt l'agenda du couple mois par mois, choisit un jour et voit ses evenements, chacun a la couleur de son auteur.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/agenda/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/agenda/rules.md

Architecture front (chemin d'une lecture, session, erreurs) :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Lecture par la page serveur (decision 0036) : `src/app/(tabs)/agenda/page.tsx` calcule aujourd'hui (`presentToday(new Date())`, jour de Paris), lit `?day=YYYY-MM-DD&month=YYYY-MM` par `presentAgendaQuery` (`presenters/agenda-query.zod.ts` ; absent, invalide ou hors des annees 2015 a aujourd'hui + 10 : aujourd'hui et son mois), puis en parallele `loadMyCouple()` du module `pairing` et `loadCalendarEvents()` (`services/`, `server-only`) sur les plages de `presentAgendaRanges` : la grille visible du mois (lundi au dimanche, 42 jours au plus) et le jour choisi seul quand la grille ne le montre pas. La page fait le `redirect()` (`resolveHomeDestination`, puis `presentAgendaPage` : `UNAUTHORIZED` vers la connexion, `CALENDAR_EVENT_COUPLE_NOT_PAIRED` vers `/pairing`, R4), jamais le presenter.
- `agendaModule()` (`services/agenda-module.factory.ts`) construit le module a chaque appel avec `getSessionToken`, jamais a l'import.
- Jours en chaines `YYYY-MM-DD` partout (decision 0047) : calculs dans `presenters/calendar-day.presenter.ts` a minuit UTC, libelles dans `presenters/day-label.presenter.ts` en UTC. Seule la vue de la grille passe en `Date` locale, par `presenters/local-date.presenter.ts` (composante par composante, jamais `new Date('YYYY-MM-DD')`), et elle passe `today` a `Calendar` pour que serveur et telephone dessinent le meme jour.
- Couleur de l'auteur (glossaire) : `presentAuthorColor`, terre cuite pour le partenaire au `joinedAt` le plus ancien (`presentCoupleCreatorId`), sauge pour l'autre ; un evenement prive est un anneau (`ui/components/author-dot.tsx`, classes des tokens seulement). Trois points au plus par jour (`MAX_MARKS_PER_DAY`), dans l'ordre de la liste : toute la journee d'abord, puis l'heure de debut, puis le titre (`compareCalendarEvents`).
- Evenement de plusieurs jours : il marque chaque jour couvert ; ses heures ne valent que le premier jour, les jours suivants il dure toute la journee ("Jusqu'au" le premier jour, "Depuis le" ensuite).
- La grille est `Calendar` du design system (decision 0048). react-day-picker dessine lui-meme chaque jour : `AgendaDayButton` lit les points par `DayMarksContext`, pose par la vue. Choisir un jour ou un mois navigue (`hooks/use-agenda-screen.ts`, `resolveAgendaHref`), et la page relit l'agenda.
- Codes que l'ecran peut recevoir : `AGENDA_SCREEN_ERROR_CODES` (`data/`), chacun avec sa cle `apiErrors.<code>` dans `src/i18n/locales/fr/agenda/calendar.json` (decision 0037).

## Tests

- `A_SHARED_CALENDAR_EVENT`, `A_PRIVATE_CALENDAR_EVENT`, `A_CALENDAR_EVENT_LIST` et `A_PAIRED_COUPLE` de `@cocooning/couple-client-business-logic/testing` pour les presenters ; `presenters/__tests__/calendar-events.ts` (`anEvent`, `CREATOR_ID`, `PARTNER_ID`) pour un evenement d'un scenario.
