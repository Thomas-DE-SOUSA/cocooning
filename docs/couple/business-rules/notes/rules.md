# Règles des notes

Ce que le couple veut que l'app impose aux notes. À lire avant de toucher au contexte `notes`, à l'éditeur ou à la liste des notes.

## À la création

### R1. Une note appartient au couple et à celle qui la crée

Je crée une note : elle est à notre couple, et j'en suis la propriétaire.

- Dans le code : à venir (PR 3 de l'étape « notes »).
- Source : [décision 0039](../../decisions/notes/0039-regles-des-notes.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-23.

### R2. Une note est partagée à sa création

Ma nouvelle note est tout de suite visible et modifiable par mon âme sœur ; je peux la rendre privée ensuite.

- Dans le code : à venir.
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

### R3. Les notes demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas de notes.

- Dans le code : à venir ([décision 0041](../../decisions/0041-couple-de-la-requete.md)).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Visibilité

### R4. Une note privée n'existe que pour sa propriétaire

Ma note privée n'apparaît pas chez l'autre, et l'app ne lui dit même pas qu'elle existe.

- Dans le code : à venir. Refus `404` (`core.md` règle 27).
- Source : décision 0039, décision 0018. Validée par : Thomas De Sousa, 2026-11-23.

### R5. Seule la propriétaire change la visibilité

Je partage ma note ou je la rends privée ; l'autre ne peut ni l'un ni l'autre. Quand je la rends privée, elle disparaît de chez l'autre, même s'il l'éditait.

- Dans le code : à venir.
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Édition à deux

### R6. Les deux partenaires modifient une note partagée en même temps

Nous écrivons tous les deux dans la liste de courses en même temps : rien ne se perd, chacun voit les frappes de l'autre.

- Dans le code : à venir ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)).
- Source : [décision 0016](../../decisions/0016-edition-des-notes-en-temps-reel.md), décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Suppression

### R7. Seule la propriétaire supprime une note

Je supprime ma note : elle disparaît pour nous deux. L'autre ne peut pas supprimer une note que j'ai créée.

- Dans le code : à venir (suppression douce, `core-backend.md` règle 13).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Lire, modifier ou supprimer la note privée de l'autre | Refusée, `404`, comme une note inexistante (R4) |
| Supprimer la note partagée de l'autre, ou changer sa visibilité | Refusée (R5, R7) ; code et statut fixés avec le domaine |
| Toute action sur les notes sans couple formé | Refusée, `404` (R3, décision 0041) |
| Longueur du titre | À fixer avec le domaine (PR 3) ; proposition à valider |

## Voir aussi

- [Glossaire des notes](glossary.md)
- [Décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md) : le canal temps réel
