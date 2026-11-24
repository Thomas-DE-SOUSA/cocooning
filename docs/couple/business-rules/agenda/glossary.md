# Glossaire de l'agenda

Les termes propres à l'agenda, avec leur nom dans le code. Les termes communs (agenda, événement d'agenda, couple, partenaire, propriétaire) sont dans le [glossaire transverse](../../../architecture/glossary.md).

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Auteur** | `ownerId` | Le partenaire qui a créé l'événement ; sa couleur marque l'événement |
| **Titre** | `CalendarEventTitle` | Le nom de l'événement, obligatoire |
| **Jour** | `startsOn` | Le jour où l'événement commence, un jour du calendrier (`AAAA-MM-JJ`) |
| **Jusqu'au** | `endsOn` | Le dernier jour d'un événement de plusieurs jours ; absent pour un événement d'un jour |
| **Heure de début, heure de fin** | `startsAt`, `endsAt` | Heures facultatives (`HH:MM`, heure de Paris) ; sans heure, l'événement dure toute la journée |
| **Toute la journée** | `startsAt` absent | Un événement sans heure |
| **Description** | `CalendarEventDescription` | Un texte simple et facultatif sous l'événement |
| **Partagé / rien que pour moi** | `CalendarEventVisibility` `SHARED` / `PRIVATE` | Un événement partagé est vu et modifié par les deux ; un événement « rien que pour moi » n'existe que pour son auteur |
| **Couleur de l'auteur** | calculée par la PWA | Terre cuite pour le partenaire qui a créé le couple, sauge pour l'autre |
