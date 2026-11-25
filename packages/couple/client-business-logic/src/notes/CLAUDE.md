# Notes

Les notes du couple depuis la PWA : lister une page, creer dans un espace et un dossier, renommer, partager, rendre privee, supprimer, deplacer ; les espaces « Partage » et « Prive » et leurs dossiers : lire un espace ou un dossier, creer, renommer, deplacer, supprimer un dossier (decision 0052). Le contenu edite a deux passe par le canal temps reel, hors de ce paquet (decision 0040).

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/notes/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/notes/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `NotesGateway` agit toujours pour le partenaire connecte : son adaptateur renvoie la session a l'API (decision 0036), l'API trouve le couple (decision 0041). Aucune methode ne prend de `coupleId` ni de `userId`.
- Deux ports : `NotesGateway` (les notes) et `NoteFoldersGateway` (`listSpaces`, `getSpaceContents`, `createFolder`, `renameFolder`, `moveFolder`, `deleteFolder`, `moveNote`), separes pour la taille des fichiers (decision D26). Use cases du second : `ListNoteSpacesUseCase`, `GetNoteSpaceContentsUseCase`, `CreateFolderUseCase`, `RenameFolderUseCase`, `MoveFolderUseCase`, `DeleteFolderUseCase`, `MoveNoteUseCase`. Un dossier `null` est la racine de l'espace. Les types de requete et de reponse viennent du contrat (`core.md rule 20`).
- `CreateNoteUseCase.execute(form, { space, folderId })` : l'appelant choisit toujours l'espace (`NoteSpaceEnum`) et le dossier ; la note prend la visibilite de l'espace (R11, R13).
- `createFolderNameFormSchema(t)` suit R13 comme le contrat : coupe, 1 a `FOLDER_NAME_MAX_LENGTH`. Cles `form.name.errors.{required,tooLong}` (decision 0031).
- `createNoteTitleFormSchema(t)` suit R8 comme le contrat : coupe, 1 a `NOTE_TITLE_MAX_LENGTH`. Cles `form.title.errors.{required,tooLong}` (decision 0031).
- Une action reservee a la proprietaire refusee arrive en `FORBIDDEN` (`NOTE_RESERVED_TO_OWNER`) ; la note privee de l'autre en `NOT_FOUND` (R4).

## Tests

- `FakeNotesGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenRefusal(error)` (vaut pour tous les appels), `A_SHARED_NOTE`, `A_NOTE_PAGE`.
- `FakeNoteFoldersGateway` (meme sous-chemin) : journal `calls`, `givenRefusal(error)` ; donnees de `note-folders-fixtures.ts` : `A_SHARED_FOLDER`, `A_SPACE_CONTENTS` (racine de « Partage » : un dossier, une note), `THE_NOTE_SPACES`.
