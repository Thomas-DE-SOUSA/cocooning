# Écarts : notes

Écarts constatés dans le contexte `notes`. On ajoute en fin de fichier ; une entrée traitée garde sa trace avec son nouveau statut.

### 001. Des use cases des dossiers IA dépassent cinq dépendances métier

- Type : écart avec une règle validée
- Constaté le : 2026-11-25, branche `feat/notes-ai-folders-backend`
- Où : `packages/couple/server-business-logic/src/notes/application/use-cases/move-note.use-case.ts`, `add-note-card.use-case.ts`, `edit-folder-template.use-case.ts`
- Constat : `MoveNoteUseCase` reçoit neuf dépendances depuis que la fiche suit sa note (R25), `AddNoteCardUseCase` sept, `EditFolderTemplateUseCase` sept : la note ou le dossier et les fiches s'écrivent dans une même `UnitOfWork`, chacun par son repository. Le flux reste une recette sans branche.
- Règle concernée : `_knowledge/backend/application.md` règle 7
- Statut : ouvert, regrouper les écritures note et fiche derrière un service ou relever la borne est à proposer au propriétaire

### 002. Les agrégats `Folder` et `NoteCard` dépassent la taille d'un fichier backend

- Type : écart avec une règle validée
- Constaté le : 2026-11-25, branche `feat/notes-ai-folders-backend`
- Où : `packages/couple/server-business-logic/src/notes/domain/models/note-card.aggregate.ts` (environ 270 lignes), `folder.aggregate.ts` (environ 210 lignes)
- Constat : les calculs des cases (`card-fields.ts`), la relecture (`note-card.snapshot.ts`) et les réglages (`smart-folder-settings.ts`) sont déjà sortis ; restent les méthodes d'intention et les accesseurs, qui forment l'agrégat. Même situation que `couple.aggregate.ts` et `note.aggregate.ts` (décision D26 ouverte).
- Règle concernée : `core.md` règle 3, décision D26
- Statut : ouvert, suit la décision D26

### 003. Le plafond de R23 compte une recherche avant qu'elle n'aboutisse

- Type : décision à trancher
- Constaté le : 2026-11-25, branche `feat/notes-ai-folders-backend`
- Où : `packages/couple/server-business-logic/src/notes/domain/services/note-card-enrichment.service.ts`
- Constat : une recherche est comptée dès qu'elle part vers SearXNG, même si le moteur ou l'IA échoue ensuite : une panne consomme le plafond du jour. C'est le choix le plus sûr pour le quota gratuit de Gemini, mais R23 ne dit pas si une recherche échouée compte.
- Règle concernée : [R23](../business-rules/notes/rules/ai-folders.md)
- Statut : ouvert, à confirmer par le propriétaire
