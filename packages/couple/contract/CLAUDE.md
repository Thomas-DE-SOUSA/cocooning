# @cocooning/couple-contract

Contrats HTTP du couple : schemas Zod 4 des requetes et des reponses et codes d'exception, partages par l'API et la PWA. Sous-chemins :

- `http-error` : `HttpErrorResponseSchema` (corps de toute erreur, `errors[]` en 422) et `ValidationIssueSchema`.
- `shared` : `OffsetPaginationQuerySchema`, `CursorPaginationQuerySchema`, `createOffsetPageResponseSchema(item)`, `createCursorPageResponseSchema(item)` (decision 0025).
- `<contexte>` : un sous-chemin par bounded context. `pairing` : `PairingExceptionCodeEnum`, `JoinCoupleRequestSchema` (code saisi, borne brute `INVITATION_CODE_ENTRY_MAX_LENGTH` de `@cocooning/couple-shared-kernel/limits` seulement : le domaine normalise et decide) et `CoupleResponseSchema` (`couple.zod.ts`, corps commun aux quatre actions, miroir de `CoupleView`, avec `togetherPeriods` : jours `YYYY-MM-DD` en chaines, `endedOn` nullable). `authentication` : `AuthenticationExceptionCodeEnum` seulement : session absente ou invalide et identifiants refuses (401), adresse ou mot de passe hors regles (422), compte deja pris ou conflit de version (409) ; leves par le domaine `authentication` et le garde de session de l'API (decision 0034). `SignInRequestSchema` (bornes brutes de `@cocooning/couple-shared-kernel/limits` seulement : la politique du mot de passe ne vaut qu'a la creation du compte, R2), `SignInResponseSchema` (jeton et echeance, lus par le seul serveur Next), `SESSION_COOKIE_NAME` (`session-cookie.ts`, partage par l'API et la PWA). La deconnexion repond 204, sans schema. `notes` : `NoteExceptionCodeEnum` (note introuvable ou privee de l'autre et couple non forme 404, action reservee a la proprietaire 403, titre invalide 422, conflit de version 409), `CreateNoteRequestSchema` et `RenameNoteRequestSchema` (titre par `NoteTitleSchema`, `note-title.zod.ts` : coupe, 1 a `NOTE_TITLE_MAX_LENGTH`), `NoteParamsRequestSchema` (`noteId` UUID), `NoteResponseSchema` et `NotePageResponseSchema` (`note.zod.ts`, page par offset de `shared`). La suppression repond 204, sans schema ; la liste lit `OffsetPaginationQuerySchema` de `shared`. `agenda` : `AgendaExceptionCodeEnum` (codes `CALENDAR_EVENT_*` : evenement introuvable ou prive de l'autre et couple non forme 404, visibilite reservee a l'auteur 403, titre, description, moment ou plage de jours invalides 422, conflit de version 409).

## A lire avant de commencer

Regles des schemas, decoupage, nommage des fichiers, codes d'exception :
@../../../_knowledge/backend/contracts.md

## Consignes de code

- Dependances runtime : `zod`, `@cocooning/shared-kernel`, et `@cocooning/couple-shared-kernel` des qu'un enum metier en vient. Aucun framework, aucune API Node : le package tourne dans le navigateur.
- Exports par sous-chemin uniquement, pas d'export racine. Un nouveau dossier de `src/` n'est importable qu'avec son entree dans `package.json` `exports`.
- Une borne partagee avec le domaine vient d'un shared kernel (`MAX_PAGE_SIZE`), jamais retapee ici.
- Modeles a copier : `src/shared/offset-pagination-query.request.ts` (requete), `src/shared/offset-page.zod.ts` (fabrique de reponse).

## Tests

- Une spec `*.spec.ts` a cote de chaque schema de requete qui a une borne, un defaut ou un `.refine()`, style BDD : un scenario accepte, un par refus.
- Jest lit `@cocooning/shared-kernel` dans ses `src` (`moduleNameMapper`).

## Pieges

- `HttpErrorResponseSchema` decrit le corps construit par `toHttpErrorBody` (`packages/server-infrastructure/src/nest/filter/http-error-body.ts`) et `ValidationIssueSchema` le type `ValidationIssue` de `zod-issue.parser.ts` : server-infrastructure ne peut pas importer le contrat, une modification d'un cote se fait de l'autre.
- `code`, `context` et `errors` sont absents du corps quand ils ne s'appliquent pas, d'ou `.optional()` malgre la regle 7 de `core.md`.
- A l'execution, l'API lit `dist/` des shared kernels : un `dist` perime donne une borne `undefined` sans erreur de type. `pnpm build` a la racine reconstruit dans l'ordre.

## Commandes

- `pnpm --filter @cocooning/couple-contract test`
- `pnpm --filter @cocooning/couple-contract check-types`
- `pnpm --filter @cocooning/couple-contract lint`
- `pnpm --filter @cocooning/couple-contract build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le schema ou le fichier modifies, trouvee avec `rg -l '<NomDuSchema>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Schema partage ajoute, retire ou renomme : la table « Shared schemas » de `_knowledge/backend/contracts.md`.
- Pagination : `docs/couple/decisions/0025-pagination.md`. Corps d'erreur : `docs/couple/decisions/0020-statut-http-des-exceptions.md`.
- Code d'exception ajoute, renomme ou retire : `rg -w <CODE> docs/couple` et la table code -> statut de l'API.
