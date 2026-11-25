# @cocooning/couple-client-business-logic

Logique metier front des contextes du couple, sans framework : partagee par toutes les vues de la PWA. Sous-chemin `shared` : `ApiError` et `ApiErrorCodeEnum` (l'erreur d'un appel a l'API vue par le front, `FORBIDDEN` pour un 403, avec le `backendCode` du contrat ou `null`) et le type `Translator` des fabriques de schemas (decision 0031). Un sous-chemin par contexte, arrive avec son premier ecran : `authentication` (formulaire de connexion `createSignInFormSchema(t)`, port `AuthenticationGateway`, `SignInUseCase`, `SignOutUseCase`), `pairing` (port `PairingGateway`, `GetMyCoupleUseCase`, `CreateCoupleUseCase`, `JoinCoupleUseCase`, `RenewInvitationCodeUseCase`, `CancelCoupleUseCase`, formulaire `createJoinCoupleFormSchema(t)`), `notes` (port `NotesGateway`, sept use cases de lecture et de commandes, formulaire `createNoteTitleFormSchema(t)` ; espaces et dossiers, decision 0052 : port `NoteFoldersGateway`, sept use cases, formulaire `createFolderNameFormSchema(t)`), `agenda` (port `AgendaGateway`, sept use cases de lecture et de commandes, formulaire `createCalendarEventFormSchema(t)`), `messaging` (cinq ports, un par agregat, onze use cases du fil, des mots flash, des photos instantanees, de l'invitation photo et des notifications, formulaire `createFlashMessageFormSchema(t)`, types `InstantPhotoUpload` et `InstantPhotoFile`), chacun avec son `CLAUDE.md`. Sous-chemin `testing` : `FakeAuthenticationGateway`, `FakePairingGateway`, `FakeNotesGateway` (`A_SHARED_NOTE`, `A_NOTE_PAGE`), `FakeNoteFoldersGateway` et ses donnees (`note-folders-fixtures.ts` : `A_SHARED_FOLDER`, `A_SPACE_CONTENTS`, `THE_NOTE_SPACES`), `FakeAgendaGateway` (`A_SHARED_CALENDAR_EVENT`, `A_PRIVATE_CALENDAR_EVENT`, `A_CALENDAR_EVENT_LIST`), les cinq fakes de `messaging` et leurs donnees (`messaging-fixtures.ts`).

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Aucun framework ni adaptateur : ni Next, ni React, ni Expo, ni `client-infrastructure` (boundaries). Un besoin d'infrastructure devient un port, classe abstraite (`core.md rule 18`), implemente dans `packages/couple/client-infrastructure`.
- Gateways et use cases renvoient un `Result` de `@cocooning/shared-kernel/utils`, jamais un `throw`.
- Deterministe : ni `Math.random`, ni `randomUUID`, ni `new Date()` (decision 0024, `business-logic.js`). Le temps arrive en parametre ou par un port.
- Schema de formulaire : `create<X>Schema(t: Translator)`, fichier `*.zod.ts`, cles `form.<field>.errors.<type>` (decision 0031).
- Un contexte ajoute : `src/<contexte>/` avec son `CLAUDE.md` au format `docs/templates/claude-server-submodule.md`, et une entree `exports` par contexte.

## Tests

- Une spec a cote du fichier, style BDD (`Feature:`, `Scenario:`), sans `should`. Fakes ecrits a la main (decision 0001).
- Les fakes que la PWA reutilise vivent dans `src/testing/` (sous-chemin `testing`, construit, hors couverture comme `__tests__/`), comme `FakeFetch` de `@cocooning/client-infrastructure/testing`. Jamais importe par du code de production.
- `pnpm test` echoue sous 100 % de couverture (decision plateforme 0013).

## Pieges

- Un fichier qui ne porte que des types n'a rien a couvrir ; un `as const` se couvre par une spec de ses valeurs (modele : `src/shared/api-error.spec.ts`).

## Commandes

- `pnpm --filter @cocooning/couple-client-business-logic test`
- `pnpm --filter @cocooning/couple-client-business-logic check-types`
- `pnpm --filter @cocooning/couple-client-business-logic lint`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou le type modifies, trouvee avec `rg -l '<NomDeType>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Chaine de donnees front et role des packages : `docs/couple/architecture/frontend/index.md`.
- Regle metier appliquee aussi cote client : la dire sur la regle backend (`docs/couple/business-rules/<contexte>/rules.md`), jamais dans une page front.
