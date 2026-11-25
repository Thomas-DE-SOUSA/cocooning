# @cocooning/couple-shared-kernel

Ce que le serveur et la PWA du couple partagent sans passer par HTTP. Sous-chemins :

- `enums` : enums metier `as const`, un fichier par enum (decision 0002) : `CouplePairingStatusEnum` (`PENDING`, `PAIRED`), lu par `pairing` et par la reponse HTTP de la PWA ; `NoteVisibilityEnum` (`PRIVATE`, `SHARED`), lu par `notes` et la PWA ; `NoteSpaceEnum` (`SHARED`, `PRIVATE`), les deux espaces des notes (R10 de `notes`), lu par `notes` et la PWA ; `CalendarEventVisibilityEnum` (`PRIVATE`, `SHARED`), lu par `agenda` et la PWA ; `InstantPhotoContentTypeEnum` (`image/jpeg`, `image/png`, `image/webp`, `image/heic`) et `MessageFeedItemTypeEnum` (`FLASH_MESSAGE`, `INSTANT_PHOTO`), lus par `messaging` et la PWA ; `PushNotificationKindEnum` (`MESSAGE_RECEIVED`, `PHOTO_PROMPT_ISSUED`, `CALENDAR_EVENT_ADDED`, `NOTE_SHARED`), toute la charge d'une notification Web Push, lue par le relais de `messaging` et le service worker de la PWA.
- `routers` : `ApiRouterEnum` et `WebRouterEnum`, avec `API_ROUTE_GROUPS` et `WEB_ROUTE_GROUPS` (la liste des fichiers de routes, lue par la spec anti-collision) et le type `RouteGroup`. API : `HealthRouteEnum` (`HEALTH_CHECK`, route publique de sante de l'API), `AuthenticationRouteEnum` (`ACCOUNT_SESSION_OPEN` et `ACCOUNT_SESSION_CLOSE` sur `/authentication/session`, distingues par le verbe), `NotesRouteEnum` (`NOTE_CREATE` et `NOTE_LIST` sur `/notes`, `NOTE_GET`, `NOTE_RENAME` et `NOTE_DELETE` sur `/notes/:noteId`, distingues par le verbe, `NOTE_SHARE`, `NOTE_MAKE_PRIVATE`, `NOTE_MOVE`, `NOTE_COLLABORATION` sur `/collab`, WebSocket du temps reel ; `NOTE_SPACE_LIST` sur `/note-spaces`, `NOTE_SPACE_CONTENTS_GET` sur `/note-spaces/:space/contents` ; `FOLDER_CREATE` sur `/note-folders`, `FOLDER_RENAME` et `FOLDER_DELETE` sur `/note-folders/:folderId`, distingues par le verbe, `FOLDER_MOVE`), `PairingRouteEnum` (`COUPLE_CREATE`, `COUPLE_GET_MINE` et `COUPLE_CANCEL` sur `/pairing/couple`, distingues par le verbe, `COUPLE_JOIN`, `COUPLE_INVITATION_CODE_RENEW`), `AgendaRouteEnum` (`CALENDAR_EVENT_CREATE` et `CALENDAR_EVENT_LIST` sur `/calendar-events`, `CALENDAR_EVENT_GET`, `CALENDAR_EVENT_EDIT` et `CALENDAR_EVENT_DELETE` sur `/calendar-events/:calendarEventId`, distingues par le verbe, `CALENDAR_EVENT_SHARE`, `CALENDAR_EVENT_MAKE_PRIVATE`), `MessagingRouteEnum` (`MESSAGE_FEED_GET` sur `/message-feed`, `FLASH_MESSAGE_SEND` et `FLASH_MESSAGE_WITHDRAW` sur `/flash-messages[/:flashMessageId]`, `INSTANT_PHOTO_SEND` et `INSTANT_PHOTO_WITHDRAW` sur `/instant-photos[/:instantPhotoId]`, `INSTANT_PHOTO_FILE_GET` sur `/instant-photos/:instantPhotoId/file`, `PHOTO_PROMPT_TODAY_GET` et `PHOTO_PROMPT_ANSWER`, `PUSH_SUBSCRIPTION_SUBSCRIBE` (`PUT /push-subscriptions`), `PUSH_SUBSCRIPTION_UNSUBSCRIBE` (`POST /push-subscriptions/unsubscribe`), `PUSH_SUBSCRIPTION_PUBLIC_KEY_GET` (`GET /push-subscriptions/public-key`)). Web : `AuthenticationRouteEnum` (`ACCOUNT_SIGN_IN`, `/sign-in`, ecran de connexion, route publique du `proxy.ts` de la PWA), `HomeRouteEnum` (`HOME`, `/`, liste des notes), `NotesRouteEnum` (`NOTE_EDITOR`, `/notes/:noteId`, page d'une note ; `NOTE_SPACE`, `/spaces/:space`, un espace des notes par sa valeur de `NoteSpaceEnum`, parametre facultatif `folderId` pour l'un de ses dossiers), `OfflineRouteEnum` (`OFFLINE`, `/~offline`, page de repli du service worker), `PairingRouteEnum` (`COUPLE_PAIRING`, `/pairing`, mise en couple tant que le couple n'est pas forme ; `COUPLE_OVERVIEW`, `/couple`, onglet "Nous"), `AgendaRouteEnum` (`AGENDA`, `/agenda`, grille du mois et jour choisi, parametres `day` et `month`), `MessagingRouteEnum` (`MESSAGES`, `/messages`, onglet "Messages" ; `INSTANT_PHOTO_FILE`, `/api/instant-photos/:instantPhotoId`, route handler de la PWA qui sert les octets d'une photo du fil, jamais en cache).
- `limits` : bornes qui sont a la fois un invariant du domaine et une borne du contrat ou d'un formulaire : `EMAIL_ADDRESS_MAX_LENGTH`, `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH` (decision 0032), `INVITATION_CODE_ENTRY_MAX_LENGTH` (code d'invitation saisi, espaces compris, R3), `NOTE_TITLE_MAX_LENGTH` (titre d'une note, R8 de `notes`), `FOLDER_NAME_MAX_LENGTH` (nom d'un dossier, R13 de `notes`), `CALENDAR_EVENT_TITLE_MAX_LENGTH` et `CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH` (R2 et R6 d'`agenda`), `CALENDAR_EVENT_RANGE_MAX_DAYS` (plage de jours d'une liste de l'agenda), `FLASH_MESSAGE_TEXT_MAX_LENGTH` et `INSTANT_PHOTO_MAX_BYTES` (R2 et R3 de `messaging`), `PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH` et `PUSH_SUBSCRIPTION_KEY_MAX_LENGTH` (adresse et cles d'un abonnement aux notifications, R11 de `messaging`).
- `exceptions` : `MissingExecutionContextException` (code `EXECUTION_CONTEXT_MISSING`), levee par le `ensureRequiredContextPresent` des guard services.

## A lire avant de commencer

Contenu des deux shared kernels et regles d'ajout :
@../../../_knowledge/backend/shared-kernel.md

## Consignes de code

- Une seule dependance runtime : `@cocooning/shared-kernel`. Aucun framework, aucune API Node : le package est importe par l'API et par la PWA.
- Exports par sous-chemin uniquement (`enums`, `routers`, `exceptions`, `limits`), pas d'export racine. `types` pointe vers `src`, `default` vers `dist`.
- Aucune logique metier : enums, routes, bornes et exceptions transverses seulement. Un enum utilise par un seul contexte reste dans son `domain/enums/`.
- Ajouter les routes d'un contexte : creer `src/routers/<api|web>/<contexte>.route.ts` (`export const NoteRouteEnum = { NOTE_LIST: '/notes' } as const satisfies RouteGroup;`, cles prefixees par l'agregat), puis l'ajouter a la fois dans `API_ROUTE_GROUPS` et par spread dans `ApiRouterEnum` (idem pour le web).
- Pas de modele de permissions ni de dossier `authorization/` (decision 0026).
- Modeles a copier : `src/exceptions/missing-execution-context.exception.ts` (exception), `src/routers/api/api-router.enum.ts` (routeur).

## Tests

- Une spec `*.spec.ts` a cote du fichier, style BDD (`Feature:`, `Scenario:`), sans `should`.
- `src/routers/routers.spec.ts` echoue si deux groupes declarent la meme cle, ou si un groupe est ajoute au routeur sans etre liste dans `*_ROUTE_GROUPS` (ou l'inverse).

## Pieges

- Un spread ecrase en silence une cle deja presente : c'est le bug de `WebRouterEnum.ExitDetail` chez Malta. Ne jamais retirer un groupe de `*_ROUTE_GROUPS`, la spec ne verrait plus ses collisions.
- `EXECUTION_CONTEXT_MISSING` n'a pas encore de statut HTTP : la table code -> statut de l'API (decision 0020) doit l'inclure quand elle sera creee.
- Jest resout `@cocooning/shared-kernel` vers ses `src` (`moduleNameMapper`) ; le build lit son `dist`, construit avant par turbo.

## Commandes

- `pnpm --filter @cocooning/couple-shared-kernel test`
- `pnpm --filter @cocooning/couple-shared-kernel check-types`
- `pnpm --filter @cocooning/couple-shared-kernel lint`
- `pnpm --filter @cocooning/couple-shared-kernel build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Enum, routeur ou exception ajoute, retire ou renomme : la section « Couple shared kernel » de `_knowledge/backend/shared-kernel.md`.
- Route renommee ou deplacee : les pages qui citent sa cle (`rg -l '<CLE_DE_ROUTE>' docs`) et la regle 18 de `_knowledge/core-frontend.md`.
- Termes `Shared kernel` et `Router enum` : `docs/architecture/glossary.md`.
