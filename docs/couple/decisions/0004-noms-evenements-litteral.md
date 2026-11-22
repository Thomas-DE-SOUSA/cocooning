---
nature: technique
status: acceptée
date: 2026-11-22
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-23
validated-on: 2026-11-23
supersedes:
superseded-by:
premortem:
---

# 0004: Nom d'un événement en littéral sur sa classe

## Contexte

Les événements de domaine de Cocooning nourrissent l'outbox PostgreSQL et le Web Push ([décision 0021](0021-outbox-postgresql-relais-dans-l-api.md)). Dans Malta, trois façons de nommer un événement coexistaient : un littéral sur la classe, un enum de noms par contexte, et des chaînes retapées dans les handlers et les jobs d'outbox. Une chaîne retapée ne casse aucun test quand l'événement est renommé.

## Décision

Le nom d'un événement de domaine est déclaré une seule fois, sur sa classe, par un `static readonly EVENT_NAME` en chaîne pointée `contexte.objet.action`, typé `as const`. Partout ailleurs (handlers, relais d'outbox, envoi des notifications, mappers), le code référence `XxxEvent.EVENT_NAME` et ne retape jamais la chaîne. Pas d'enum de noms.

## Alternatives écartées

- **Un enum de noms par contexte** : une seconde source pour chaque nom, que la classe recopie, et qui ne dit pas quelle classe porte le nom. Il contredit aussi la [décision 0002](0002-enums-as-const.md).
- **Des chaînes dans les consommateurs** : un renommage passe la compilation et casse silencieusement l'envoi des notifications.

## Conséquences

- **Contrôle automatique** : `scripts/check-event-names.mjs`, livré en phase 2 avec le premier bounded context, échoue si une classe de `domain/events/` n'a pas son `EVENT_NAME` ou si l'un de ces noms apparaît en chaîne hors de sa classe. Il tourne dans `pnpm lint` et en CI.
- Une déduction d'opération par suffixe (`.created`) devient une table explicite de `EVENT_NAME` vers l'opération.

## Risques

- L'application web n'importe pas les classes d'événements du serveur : un nom lu côté client reste une chaîne. Ce cas n'est pas couvert.
