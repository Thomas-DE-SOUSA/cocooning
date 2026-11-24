---
nature: technique
status: acceptée
date: 2026-11-24
deciders: [Thomas De Sousa]
validated-by: Thomas De Sousa, 2026-11-24
validated-on: 2026-11-24
supersedes:
superseded-by:
premortem:
---

# 0047: Les jours et les heures de l'agenda sont ceux de Paris, sans instant

## Contexte

Un événement d'agenda commence un jour, peut finir un autre jour et peut avoir une heure de début et de fin ([règle R5](../../business-rules/agenda/rules.md), [décision 0046](0046-regles-de-l-agenda.md)). Le couple vit à Paris, ses deux téléphones sont réglés sur Paris, et l'agenda se lit comme un calendrier papier : « le 5 décembre à 20 h ». Il faut choisir comment l'API reçoit, garde et rend ces moments. Ailleurs, le dépôt garde des instants UTC (`createdAt`, `updatedAt`) et `pairing` garde déjà ses périodes ensemble en jours `YYYY-MM-DD` ([décision 0045](../pairing/0045-periodes-ensemble-du-couple.md)).

## Décision

- Un jour est une chaîne `YYYY-MM-DD` (`startsOn`, `endsOn`), une heure une chaîne `HH:MM` de l'horloge de Paris (`startsAt`, `endsAt`). Le contrat, le domaine et la base les gardent tels quels, sans conversion.
- La base les range en `DATE` pour les jours et en `VARCHAR(5)` pour les heures : le jour sert aux requêtes de plage, l'heure ne sert qu'à l'ordre et à l'affichage.
- Le domaine compare jours et heures comme des chaînes : leur écriture à zéros fixes garde l'ordre du calendrier. `isCalendarDay` (`@cocooning/shared-kernel/utils`) refuse un jour qui n'existe pas.
- Sans heure de début, l'événement dure toute la journée ; aucune heure n'est inventée pour le ranger.

Réponse du propriétaire, le 2026-11-24, à « Ton « go » sur #94 vaut-il aussi pour la décision 0047 et les 2 000 signes ? » : « go ».

## Alternatives écartées

- **Instants UTC (`timestamptz`)** pour le début et la fin : il faudrait un fuseau à chaque lecture et à chaque écriture, côté PWA comme côté API ; un événement « toute la journée » n'a pas d'instant naturel, et un changement d'heure (fin mars, fin octobre) décalerait un jour ou une heure si une conversion était oubliée.
- **Instant UTC et fuseau stocké à côté** : utile pour un agenda partagé entre fuseaux, que deux personnes à Paris n'ont pas (décision P1).
- **Heure en `TIME`** : Prisma la rend en `Date` du 1er janvier 1970, qu'il faudrait reconvertir en `HH:MM` à chaque lecture sans gain pour l'ordre.

## Conséquences

- La PWA envoie et affiche ce que le partenaire a saisi, sans calcul de fuseau ; le mois affiché se lit par une plage de jours (`from`, `to`).
- Un voyage dans un autre fuseau montrera les heures de Paris : accepté pour un couple qui vit à Paris.
- Les dates techniques (`createdAt`, `updatedAt`, `deletedAt`, outbox) restent des instants UTC.
- Les pages [architecture de l'agenda](../../architecture/agenda/index.md) et [agrégat](../../architecture/agenda/aggregate.md) décrivent ce choix dans le code.

## Risques

- Si le couple voulait un jour des rappels (notifications à l'heure d'un événement, hors du premier lot), il faudrait convertir l'heure de Paris en instant au moment de planifier le rappel, en tenant compte du changement d'heure.
