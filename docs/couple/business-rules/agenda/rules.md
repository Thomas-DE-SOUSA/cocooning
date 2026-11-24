# Règles de l'agenda

Ce que le couple veut que l'app impose à l'agenda. À lire avant de toucher au contexte `agenda` ou à l'écran de l'agenda.

## À la création

### R1. Un événement appartient au couple et à celui qui le crée

Je crée un événement : il est à notre couple, et j'en suis l'auteur. Ma couleur le marque.

- Dans le code : à venir avec le contexte `agenda`.
- Source : [décision 0046](../../decisions/agenda/0046-regles-de-l-agenda.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-24.

### R2. Un événement a un titre

Je donne toujours un titre à un événement ; les espaces autour ne comptent pas, un titre vide est refusé. Il fait 120 signes au plus, comme le titre d'une note.

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R3. Un événement est partagé à sa création

Mon nouvel événement est tout de suite visible et modifiable par mon âme sœur, sauf si je coche « rien que pour moi ».

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R4. Les événements demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas d'agenda.

- Source : décision 0046, [décision 0041](../../decisions/0041-couple-de-la-requete.md). Validée par : Thomas De Sousa, 2026-11-24.

## Le moment

### R5. Un jour, et le reste est facultatif

Un événement commence un jour. Je peux ajouter un dernier jour (« jusqu'au ») pour un week-end ou un voyage : il vient après le premier. Sans heure, l'événement dure toute la journée ; je peux ajouter une heure de début, puis une heure de fin, qui vient après le début quand l'événement tient en un jour. Les heures sont celles de Paris.

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R6. Une description facultative

J'ajoute si je veux quelques lignes de texte simple sous l'événement, 2 000 signes au plus.

- Source : décision 0046 (description facultative, réponse du propriétaire) ; la limite de 2 000 signes est une proposition de Claude, à confirmer. Validée par : Thomas De Sousa, 2026-11-24.

## Visibilité

### R7. Un événement « rien que pour moi » n'existe que pour son auteur

Mon événement privé n'apparaît pas chez l'autre, ni dans la liste ni par un point sur le calendrier, et l'app ne lui dit même pas qu'il existe.

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

### R8. Seul l'auteur change la visibilité

Je rends privé ou je partage mon événement ; l'autre ne peut pas cacher mon événement à moi-même.

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

## Modification et suppression

### R9. Les deux modifient et suppriment un événement partagé

Nous modifions ou supprimons tous les deux n'importe quel événement partagé ; il disparaît pour nous deux. Un événement privé ne se modifie et ne se supprime que par son auteur, le seul à le voir.

- Source : décision 0046. Validée par : Thomas De Sousa, 2026-11-24.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Lire, modifier ou supprimer l'événement privé de l'autre | Refusé, comme un événement inexistant (R7) |
| Changer la visibilité de l'événement partagé de l'autre | Refusé, réservé à l'auteur (R8) |
| Toute action sur l'agenda sans couple formé | Refusée (R4) |
| Titre vide ou trop long, description trop longue | Refusé (R2, R6) |
| Dernier jour avant le premier, heure de fin avant l'heure de début le même jour, heure de fin sans heure de début | Refusé (R5) |

## Voir aussi

- [Glossaire de l'agenda](glossary.md)
