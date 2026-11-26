# Règles des listes

Les listes de courses et de tâches de l'onglet Listes : des notes à cocher. À lire avant de toucher aux listes ou à l'onglet Listes. Les envies auront leurs propres règles.

## Les listes

### R26. Une liste est une note à cocher, dans Courses ou Tâches

Je crée une liste dans Courses ou dans Tâches, commune ou rien que pour moi, avec un titre et, si je veux, un emoji. Elle suit les règles des notes : elle est à moi et à notre couple (R1), privée elle n'existe que pour moi (R4), commune nous l'écrivons à deux en direct (R6).

- Dans le code : `CreateNoteListUseCase`, `Note.createList` (visibilité de l'espace, `visibilityOfSpace`), `NoteList`, `NoteListKindEnum`, `NoteListEmoji` (`NOTE_LIST_EMOJI_MAX_LENGTH` points de code), `EditNoteListUseCase`, `Note.editList` (les deux partenaires sur une liste commune, comme R6) ; une liste s'ouvre, s'écrit à deux, se partage, se rend privée et se supprime par les routes et le canal temps réel des notes ; `GetNoteUseCase` dit sa section et son emoji (`NoteDetailView`).
- Source : [décision 0058](../../../decisions/notes/0058-listes-sur-les-notes.md). Validée par : Thomas De Sousa, 2026-11-26 (« go »).

### R27. Les listes vivent dans l'onglet Listes

Une liste n'apparaît ni dans « Partagé » ni dans « Privé » des notes, ni dans « Modifiées récemment » ; on ne la range pas dans un dossier.

- Dans le code : `NoteRepository.findVisible`, `findVisibleIn`, `countVisibleByFolder` et `countVisibleBySpace` filtrent `list_kind IS NULL` dans la requête (`ordinaryNotesVisibleTo`, `apps/couple/api/src/modules/notes/secondary/repositories/note-prisma.query.ts`) ; `Note.createList` crée à la racine, `Note.moveTo` refuse une liste (`NoteListValidator.ensureMovable`, `NOTE_LIST_NOT_MOVABLE`).
- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

### R28. L'accueil dit ce qui reste

L'accueil d'une section range les listes en « Communes » et « Rien que pour moi », et dit pour chacune combien de lignes restent à cocher.

- Dans le code : `ListNoteListsUseCase`, `NoteRepository.findVisibleLists` (la plus récemment modifiée d'abord) ; `SaveNoteDocumentUseCase` compte les lignes non cochées par `NoteChecklistReader` (`YjsNoteChecklistReader` : éléments `taskItem` sans `checked` vrai, à toute profondeur) et les écrit avec le document (`NoteContentRepository.saveContent`, colonne `open_item_count`) ; la PWA range en « Communes » et « Rien que pour moi » par la visibilité.
- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

## Cocher

### R29. Une coche garde qui l'a faite

Je coche « Pain » : la case prend ma couleur, et chez l'autre elle dit « Toi ». Terre cuite pour « Moi », sauge pour « Toi », selon qui regarde.

- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

### R30. Une ligne cochée descend dans « Fait »

Une ligne cochée se barre et descend dans « Fait » ; je la décoche, elle remonte avec les lignes à prendre.

- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

### R31. « Vider les faits » retire les lignes cochées

Je vide les faits : les lignes cochées disparaissent pour nous deux, sans historique.

- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

### R32. On voit quand l'autre est dans la liste

Pendant que nous sommes tous les deux dans la même liste, je vois « Ton âme sœur est dans la liste », et ses coches arrivent tout de suite.

- Dans le code : le canal temps réel des notes (`NoteCollaborationServer`, [décision 0040](../../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)) ; la présence est celle de Hocuspocus, sans code serveur propre aux listes.
- Source : décision 0058. Validée par : Thomas De Sousa, 2026-11-26 (« go »).

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Ouvrir, modifier ou supprimer la liste « rien que pour moi » de l'autre | Refusée, `404` `NOTE_NOT_FOUND`, comme une liste inexistante (R4) |
| Modifier par une route des listes une note qui n'est pas une liste | Refusée, `404` `NOTE_LIST_NOT_FOUND` (R26) |
| Ranger une liste dans un dossier, ou la déplacer par la route des notes | Refusé, `422` `NOTE_LIST_NOT_MOVABLE` (R27) |
| Emoji vide ou trop long | Refusé, `422` `NOTE_LIST_EMOJI_INVALID` (R26) |
| Titre vide ou trop long | Refusé, `422` `NOTE_TITLE_INVALID` (R8) |
| Un document illisible à l'enregistrement | Le contenu est enregistré, ses lignes comptent 0 (R28) |
