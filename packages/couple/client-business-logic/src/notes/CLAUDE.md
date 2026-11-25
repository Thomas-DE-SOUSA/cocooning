# Notes

Les notes du couple depuis la PWA : lister une page, ouvrir, creer dans un espace et un dossier, renommer, supprimer, deplacer (le deplacement vers l'autre espace partage la note ou la rend privee, R11 ; plus de commande de partage dans la PWA, decision 0053) ; les espaces « Partage » et « Prive » et leurs dossiers : lire un espace ou un dossier, creer, renommer, deplacer, supprimer un dossier (decision 0052). Le contenu edite a deux passe par le canal temps reel, hors de ce paquet (decision 0040).

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/notes/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/notes/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `NotesGateway` agit toujours pour le partenaire connecte : son adaptateur renvoie la session a l'API (decision 0036), l'API trouve le couple (decision 0041). Aucune methode ne prend de `coupleId` ni de `userId`.
- Deux ports : `NotesGateway` (les notes) et `NoteFoldersGateway` (`listSpaces`, `getSpaceContents`, `createFolder`, `proposeFolderTemplate`, `editFolderTemplate`, `renameFolder`, `moveFolder`, `deleteFolder`, `moveNote`), separes pour la taille des fichiers (decision D26). Use cases du second : `ListNoteSpacesUseCase`, `GetNoteSpaceContentsUseCase`, `CreateFolderUseCase`, `ProposeFolderTemplateUseCase`, `EditFolderTemplateUseCase`, `RenameFolderUseCase`, `MoveFolderUseCase`, `DeleteFolderUseCase`, `MoveNoteUseCase`.
- Dossiers IA (R17, R18) : `CreateFolderUseCase.execute(form, destination)` cree un dossier classique d'un `FolderNameForm`, un dossier IA d'un `SmartFolderForm` (nom, sujet, cases) ; un dossier cree dans un dossier IA part classique et l'API le rend IA. `ProposeFolderTemplateUseCase.execute(form, destination)` demande le sujet et les cases a l'IA ; `EditFolderTemplateUseCase.execute(folderId, form)` les corrige. Les cases du formulaire (`fields`) deviennent `cardTemplate` dans la requete. Un dossier `null` est la racine de l'espace. Les types de requete et de reponse viennent du contrat (`core.md rule 20`).
- Fiches (R19 a R22) : troisieme port `NoteCardsGateway` (`addNoteCard`, `chooseNoteCardCandidate`, `refineNoteCard`, `refreshNoteCard`, `correctNoteCardField`), use cases `AddNoteCardUseCase.execute(folderId, form)` (rend la note et sa fiche `PENDING`), `ChooseNoteCardCandidateUseCase.execute(noteId, candidateIndex)`, `RefineNoteCardUseCase.execute(noteId, form)`, `RefreshNoteCardUseCase.execute(noteId)`, `CorrectNoteCardFieldUseCase.execute(noteId, fieldName, form)` ; chacun rend la fiche (`NoteCardResponse`). Le statut se lit par `NoteCardStatusEnum`, jamais une chaine.
- Formulaires des fiches, comme le contrat : `createNoteCardNameFormSchema(t)` (R19, la regle du titre R8, cles `form.name.errors.{required,tooLong}`), `createNoteCardQueryFormSchema(t)` (1 a `NOTE_CARD_QUERY_MAX_LENGTH`, `form.query.errors.*`), `createNoteCardFieldFormSchema(t)` (R22, 1 a `CARD_FIELD_VALUE_MAX_LENGTH`, `form.value.errors.*`).
- `GetNoteUseCase` rend la note et sa fiche (`NoteDetailResponse`, `card` a `null` hors d'un dossier IA, R20).
- `CreateNoteUseCase.execute(form, { space, folderId })` : l'appelant choisit toujours l'espace (`NoteSpaceEnum`) et le dossier ; la note prend la visibilite de l'espace (R11, R13).
- `createFolderNameFormSchema(t)` suit R13 comme le contrat : coupe, 1 a `FOLDER_NAME_MAX_LENGTH`. Cles `form.name.errors.{required,tooLong}` (decision 0031).
- `createFolderTemplateFormSchema(t)` suit R17 comme le contrat : sujet coupe, 1 a `FOLDER_SUBJECT_MAX_LENGTH` ; 1 a `CARD_TEMPLATE_MAX_FIELDS` cases, chacune coupee, 1 a `CARD_FIELD_NAME_MAX_LENGTH`, jamais deux fois la meme sans tenir compte de la casse. Cles `form.subject.errors.{required,tooLong}`, `form.fields.errors.{required,tooMany,tooLong,duplicate}`. `createSmartFolderFormSchema(t)` y ajoute le nom de `createFolderNameFormSchema(t)`.
- `createNoteTitleFormSchema(t)` suit R8 comme le contrat : coupe, 1 a `NOTE_TITLE_MAX_LENGTH`. Cles `form.title.errors.{required,tooLong}` (decision 0031).
- Une action reservee a la proprietaire refusee arrive en `FORBIDDEN` (`NOTE_RESERVED_TO_OWNER`) ; la note privee de l'autre en `NOT_FOUND` (R4).

## Tests

- `FakeNotesGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenRefusal(error)` (vaut pour tous les appels), `A_SHARED_NOTE`, `A_NOTE_PAGE`.
- `FakeNoteFoldersGateway` (meme sous-chemin) : journal `calls`, `givenRefusal(error)` ; donnees de `note-folders-fixtures.ts` : `A_SHARED_FOLDER`, `A_SMART_FOLDER` (« Restaurants », sujet et fiche type), `A_PROPOSED_TEMPLATE`, `A_SPACE_CONTENTS` (racine de « Partage » : un dossier, une note), `THE_NOTE_SPACES`.
- `FakeNoteCardsGateway` (meme sous-chemin) : journal `calls`, `givenRefusal(error)` ; donnees de `note-cards-fixtures.ts` pour l'ecran : `A_FILLED_NOTE_CARD` (une case « non trouve »), `A_PENDING_NOTE_CARD`, `A_CHOOSING_NOTE_CARD` (deux candidats), `A_SMART_SPACE_CONTENTS` (« Restaurants » ouvert, `cardContext` et une note par fiche).
