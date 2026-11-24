# Notes

Le partenaire voit les notes du couple a l'accueil, en cree une par son titre, ouvre la page d'une note pour la renommer et l'ecrire a deux en temps reel, et pour ses propres notes les partage, les rend privees ou les supprime.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/notes/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/notes/rules.md

Architecture front (chemin d'une lecture, session, erreurs) :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Lecture par la page serveur (decision 0036) : `src/app/(tabs)/(home)/page.tsx` verifie le couple par `resolveHomeDestination` du module `pairing`, puis `loadNotes()` (`services/`, `server-only`) et le presenter pur `presentNotesPage`. La page fait le `redirect()`, jamais le presenter : `UNAUTHORIZED` vers la connexion, `NOTE_COUPLE_NOT_PAIRED` vers `/pairing` (R3).
- `notesModule()` (`services/notes-module.factory.ts`) construit le module a chaque appel avec `getSessionToken`, jamais a l'import.
- Les actions reservees a la proprietaire (R5, R7) ne s'affichent que sur une note `isOwner`, calcule par l'API ; la PWA ne connait pas le `userId` du partenaire. La suppression demande une confirmation (`deletionAsked` dans `hooks/use-notes-screen.ts`).
- Les actions rendent `Result<null, ApiError>` ; `services/note-commands.service.ts` revalide le titre (`createNoteTitleFormSchema(t)`) et l'identifiant (`NoteParamsRequestSchema`) cote serveur (`core-frontend.md` regle 14). `hooks/use-note-commands.ts` : une commande a la fois, `pending` dit laquelle et sur quelle note. Apres un refus, `resolveNoteCommandFailureFollowUp` : `UNAUTHORIZED` vers la connexion ; `NOT_FOUND`, `FORBIDDEN` et `CONFLICT` relisent la liste.
- Page d'une note (`src/app/notes/[noteId]/`, `WebRouterEnum.NOTE_EDITOR`) : `loadNote(noteId)` puis `presentNotePage`, qui renvoie vers la liste une note disparue ou privee de l'autre (`NOT_FOUND`, R4) et un identifiant invalide. Le renommage (R6) passe par `hooks/use-rename-note.ts` et `services/note-commands.service.ts` (`renameNote`, titre et identifiant revalides). Le lien d'une note (`href`) est calcule par `toNoteListItem` (`presenters/note-list-item.presenter.ts`) avec `resolveRoute` de `@cocooning/client-infrastructure`. Le contenu s'ecrit a deux dans Tiptap : `NoteContainer` construit `HocuspocusNoteDocumentGateway` avec l'adresse passee par la page, `useNoteDocument` garde un seul `Y.Doc` et le rouvre apres une fermeture par le serveur, `useNoteEditor` configure Tiptap (detail : `docs/couple/architecture/notes/collaboration.md`, section "Dans la PWA"). Jamais de `HocuspocusProvider` hors de `gateways/hocuspocus/` (ecart frontend 006).
- Allure (decision plateforme 0017, planche approuvee) : une note de la liste est une `Card`, sa visibilite une etiquette `NoteVisibilityBadge` (sauge pour partagee, contour pour privee), separee de `NoteMeta` (proprietaire et date) ; les actions de la proprietaire sont en `outline`, la suppression en `ghost` puis `destructive` a la confirmation. Le contenu de l'editeur se style par `CONTENT_CLASS` de `hooks/use-note-editor.ts` (cases a cocher en `accent-primary`).
- `useNoteTitleForm(namespace, title)` sert la creation (`notes/list`) et le renommage (`notes/note`) : les messages viennent du namespace de l'ecran.
- Codes que les ecrans peuvent recevoir : `NOTES_SCREEN_ERROR_CODES` et `NOTE_SCREEN_ERROR_CODES` (`data/`), chacun avec sa cle `apiErrors.<code>` dans `src/i18n/locales/fr/notes/list.json` et `note.json` (decision 0037).

## Tests

- `FakeNoteDocumentGateway` (`gateways/fake/`) pour `useNoteDocument` : la spec joue le serveur par les evenements de la derniere connexion. L'adaptateur Hocuspocus et l'editeur Tiptap ne se testent qu'avec l'API, a la main (ecart frontend 003).
- `FakeNoteCommandGateway` (`gateways/fake/`) pour `useNoteCommands`, avec `holdAnswers()` pour voir une commande en cours ; `FakeNotesGateway`, `A_SHARED_NOTE` et `A_NOTE_PAGE` de `@cocooning/couple-client-business-logic/testing` pour les services et le presenter.
