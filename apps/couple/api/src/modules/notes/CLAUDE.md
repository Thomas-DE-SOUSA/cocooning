# Module notes de l'API

Adaptateurs du contexte `notes` : `NotePrismaRepository` (`secondary/repositories/`, etat et outbox `note_event` dans une transaction, visibilite filtree par la requete), `PairedCouplePrismaProvider` (`secondary/providers/`, lecture seule des tables de `pairing`, decision 0041) et leurs mappers Prisma (`secondary/mappers/`). Les use cases sont construits par `notesUseCase()` (`notes-use-case.factory.ts`) dans `notes-service.module.ts`, qui fournit aussi `NoteCoupleGuardService` (decision 0006). Sept controleurs (`primary/controllers/`, `ApiRouterEnum.NOTE_*`), chacun sous `@UseGuards(NoteCoupleGuard)` (`primary/couple/`) : le garde resout le couple forme du partenaire par `NoteCoupleGuardService` et le pose sur la requete, `@CurrentCouple()` le donne au controleur. Mappers `toNoteResponse` et `toNotePageResponse` (`primary/mappers/`, dates ISO).

Modele a copier pour le prochain contexte du couple (agenda, messages) : `primary/couple/` (garde et decorateur du couple), `test/notes/` (`NotesTestApp`, une spec par route, isolation par couple et par proprietaire).

Contexte metier :
@../../../../../../packages/couple/server-business-logic/src/notes/CLAUDE.md

Canal temps reel (decision 0040, `docs/couple/architecture/notes/collaboration.md`) : `primary/collaboration/` (`NoteCollaborationServer` sur `ApiRouterEnum.NOTE_COLLABORATION`, crochets Hocuspocus, pont `ws`), `secondary/collaboration/` (`NoteHocuspocus`, `HocuspocusNoteCollaborationProvider`), `NoteContentPrismaRepository`. Hocuspocus et Yjs se chargent par `esm-packages.ts`, jamais par un `import` direct (TS1479, D31).
