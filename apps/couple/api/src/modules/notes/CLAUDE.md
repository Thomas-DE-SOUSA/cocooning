# Module notes de l'API

Adaptateurs du contexte `notes` : `NotePrismaRepository` (`secondary/repositories/`, etat et outbox `note_event` dans une transaction, visibilite filtree par la requete), `PairedCouplePrismaProvider` (`secondary/providers/`, lecture seule des tables de `pairing`, decision 0041) et leurs mappers Prisma (`secondary/mappers/`). Les use cases sont construits par `notesUseCase()` (`notes-use-case.factory.ts`) dans `notes-service.module.ts`, qui fournit aussi `NoteCoupleGuardService` (decision 0006). Les controleurs arrivent avec le contrat HTTP des notes.

Contexte metier :
@../../../../../../packages/couple/server-business-logic/src/notes/CLAUDE.md
