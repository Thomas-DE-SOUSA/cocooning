# Règles des notes

Ce que le couple veut que l'app impose aux notes. À lire avant de toucher au contexte `notes`, à l'éditeur ou à la liste des notes.

## À la création

### R1. Une note appartient au couple et à celle qui la crée

Je crée une note : elle est à notre couple, et j'en suis la propriétaire.

- Dans le code : `CreateNoteUseCase`, `Note.create`.
- Source : [décision 0039](../../decisions/notes/0039-regles-des-notes.md), [décision 0018](../../decisions/0018-portee-par-couple-et-proprietaire.md). Validée par : Thomas De Sousa, 2026-11-23.

### R2. Une note est partagée à sa création

Ma nouvelle note est tout de suite visible et modifiable par mon âme sœur ; je peux la rendre privée ensuite.

- Dans le code : `Note.create`, visibilité `SHARED`.
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

### R3. Les notes demandent un couple formé

Tant que nous ne sommes pas en couple dans l'app, je n'ai pas de notes.

- Dans le code : `NoteCoupleGuardService` et `PairedCoupleProvider` ([décision 0041](../../decisions/0041-couple-de-la-requete.md)), refus `NOTE_COUPLE_NOT_PAIRED`.
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Visibilité

### R4. Une note privée n'existe que pour sa propriétaire

Ma note privée n'apparaît pas chez l'autre, et l'app ne lui dit même pas qu'elle existe.

- Dans le code : `NoteRepository.findVisibleById` et `findVisible` filtrent par la requête ; `NotePreconditionService.loadVisibleNote` refuse `NOTE_NOT_FOUND` (`core.md` règle 27).
- Source : décision 0039, décision 0018. Validée par : Thomas De Sousa, 2026-11-23.

### R5. Seule la propriétaire change la visibilité

Je partage ma note ou je la rends privée ; l'autre ne peut ni l'un ni l'autre. Quand je la rends privée, elle disparaît de chez l'autre, même s'il l'éditait.

- Dans le code : `ShareNoteUseCase`, `MakeNotePrivateUseCase`, `NoteAccessValidator.ensureOwner` (`NOTE_RESERVED_TO_OWNER`).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Édition à deux

### R6. Les deux partenaires modifient une note partagée en même temps

Nous écrivons tous les deux dans la liste de courses en même temps : rien ne se perd, chacun voit les frappes de l'autre.

- Dans le code : `RenameNoteUseCase` pour le titre ; le contenu arrive avec le canal temps réel ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)).
- Source : [décision 0016](../../decisions/0016-edition-des-notes-en-temps-reel.md), décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Suppression

### R7. Seule la propriétaire supprime une note

Je supprime ma note : elle disparaît pour nous deux. L'autre ne peut pas supprimer une note que j'ai créée.

- Dans le code : `DeleteNoteUseCase`, `Note.delete` (suppression douce, `core-backend.md` règle 13).
- Source : décision 0039. Validée par : Thomas De Sousa, 2026-11-23.

## Le titre

### R8. Un titre fait de 1 à 120 signes

Je donne un titre à ma note ; les espaces autour ne comptent pas, un titre vide est refusé.

- Dans le code : `NoteTitle.create`, `NOTE_TITLE_MAX_LENGTH` (`@cocooning/couple-shared-kernel/limits`).
- Source : proposition de Claude avec le domaine (PR 2 de l'étape « notes », 2026-11-23). Validée par : à compléter.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Lire, modifier ou supprimer la note privée de l'autre | Refusée, `404`, comme une note inexistante (R4) |
| Supprimer la note partagée de l'autre, ou changer sa visibilité | Refusée, `403` `NOTE_RESERVED_TO_OWNER` (R5, R7) |
| Toute action sur les notes sans couple formé | Refusée, `404` `NOTE_COUPLE_NOT_PAIRED` (R3, décision 0041) |
| Note inconnue, supprimée ou privée de l'autre | Refusée, `404` `NOTE_NOT_FOUND` (R4) |
| Deux écritures de la même note en même temps | Refusée, `409` `NOTE_VERSION_CONFLICT` |
| Titre vide ou trop long | Refusé, `422` `NOTE_TITLE_INVALID` (R8) |

## Voir aussi

- [Glossaire des notes](glossary.md)
- [Décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md) : le canal temps réel
