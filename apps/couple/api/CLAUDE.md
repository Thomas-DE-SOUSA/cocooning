# couple-api

API NestJS 11 (CommonJS, decision plateforme 0011) du domaine couple : racine de composition hexagonale. Elle assemble les packages et n'a aucune logique metier.

- `src/main.ts` : `Uuid.configure(new UuidV7GeneratorProvider())` une seule fois (decision 0024), `enableShutdownHooks`, ecoute sur `PORT`. Rien d'autre : pas de `useGlobal*`, pas de prefixe global, pas de Swagger.
- `src/env.ts` : schema Zod de l'API compose avec `couplePrismaEnvSchema`, `authenticationEnvSchema`, `pairingEnvSchema`, `messagingEnvSchema` et `notesEnvSchema` (`.extend(fragment.shape)`, Zod 4), valide par `ConfigModule.forRoot({ validate })`. `src/env.spec.ts` parse `.env.example`.
- `src/app.module.ts` : configuration, `LoggerModule` et `PrismaModule` en `forRootAsync` (fabriques dans `src/config/`), `ClockModule`, `IdentifierModule`, `CryptoModule`, `MessagingModule`, `AuthenticationModule`, `PairingModule`, `NotesModule`, `AgendaModule`, `MessagingModule` du contexte (importe sous l'alias `MessagingContextModule`), `StorageModule` en `forRootAsync` (port `FileStorage`, dossier `FILE_STORAGE_DIRECTORY`), `APP_GUARD` (`SessionGuard`), `APP_FILTER` (`HttpExceptionFilter` + `EXCEPTION_STATUSES`), `cookie-parser` puis `RequestIdMiddleware` sur toutes les routes.
- `src/exception-statuses.ts` : la table code -> statut (decision 0020). Un code absent repond 500 sans son message.
- `src/health/` : `GET ApiRouterEnum.HEALTH_CHECK`, public, `SELECT 1` par `PrismaService`.
- `src/modules/authentication/` : connexion, deconnexion et session (decision 0034, stub `CLAUDE.md`). Trois modules comme `pairing` ; `AuthenticationModule` exporte les use cases pour que `AppModule` construise `SessionGuard`. `SessionGuard` global, ferme par defaut : lit le cookie `SESSION_COOKIE_NAME` (`@cocooning/couple-contract/authentication`) et appelle `ResolveSessionUseCase`, sinon 401 (`AUTHENTICATION_SESSION_MISSING` ou `_INVALID`). `@CurrentPartner()` donne le `PartnerContext { userId }` au controleur. `env.ts` du module : `AUTH_JWT_SECRET`, `AUTH_SESSION_TTL_DAYS`.
- `src/commands/` : commandes d'exploitation lancees sur la VM (decision plateforme 0016, `CLAUDE.md` du dossier). `create-account/` cree un compte (R6) dans un contexte Nest sans HTTP, sur `AuthenticationSecondaryModule` ; `record-together-periods/` enregistre les periodes ensemble du couple (R9) sur `AuthenticationSecondaryModule` et `PairingSecondaryModule`.
- `src/modules/pairing/` : premier contexte (stub `CLAUDE.md`). Trois modules : `PairingModule` (quatre controleurs), `PairingServiceModule` (use cases par `pairingUseCase()`, `PairingPreconditionService` et `EventPublishingService` crees dans la fabrique), `PairingSecondaryModule` (`provide: CoupleRepository`, `useClass: CouplePrismaRepository`). Routes `ApiRouterEnum.COUPLE_*`. `env.ts` du module : `PAIRING_INVITATION_CODE_TTL_HOURS`.
- `MessagingModule` (`@cocooning/server-infrastructure/messaging`) fournit `EventPublisher` : publication en processus, qui ne fait que journaliser ; le relais de l'outbox du module `messaging` livre (decisions 0021 et 0051), jamais un abonne d'`EventPublisher`, qui notifierait deux fois.
- `src/modules/notes/` : premier contexte du couple (stub `CLAUDE.md`). `NotesModule` : controleurs `ApiRouterEnum.NOTE_*`, `NOTE_SPACE_*` et `FOLDER_*` des dossiers (decision 0052) et des dossiers IA (decision 0054), `NOTE_LIST_*` des listes de l'onglet Listes (decision 0058, notes a cocher dont `YjsNoteChecklistReader` compte les lignes a chaque enregistrement du document), tous sous `@UseGuards(NoteCoupleGuard)` (`primary/couple/`), qui pose l'`ExecutionContext` du couple forme apres le garde de session (decision 0041) ; `@CurrentCouple()` le lit, sinon `EXECUTION_CONTEXT_MISSING` (500). Canal temps reel Hocuspocus sur `/collab` (`NoteCollaborationServer`, decision 0040). Tache de fond des fiches des dossiers IA `NoteCardEnrichmentScheduler` (decision 0054, coupee par `NOTE_CARD_ENRICHMENT_ENABLED=false`). Puis `NotesServiceModule` (use cases par `notesUseCase()`, `NoteCoupleGuardService` en provider, decision 0006), `NotesSecondaryModule` (`NoteRepository` -> `NotePrismaRepository`, `FolderRepository` -> `FolderPrismaRepository`, `PairedCoupleProvider` -> `PairedCouplePrismaProvider`, decision 0041 ; `NoteCardWriter` -> `GeminiNoteCardWriter`, cree par `geminiNoteCardWriterProvider` qui lit `NOTE_CARD_GEMINI_*` de l'`env.ts` du module ; `PlaceDirectory` -> `NominatimPlaceDirectory`, cree par `nominatimPlaceDirectoryProvider` qui lit `PLACE_DIRECTORY_*`, decision 0055).
- `src/modules/agenda/` : agenda partage (stub `CLAUDE.md`). `AgendaModule` : onze controleurs (`ApiRouterEnum.CALENDAR_EVENT_*` et `CALENDAR_LABEL_*` des etiquettes, decision 0056), tous sous `@UseGuards(AgendaCoupleGuard)` (`primary/couple/`, copie du garde de `notes`, decision 0041). Puis `AgendaServiceModule` (use cases par `agendaUseCase()`, `AgendaCoupleGuardService` en provider, decision 0006), `AgendaSecondaryModule` (`CalendarEventRepository` -> `CalendarEventPrismaRepository`, `CalendarLabelRepository` -> `CalendarLabelPrismaRepository`, `PairedCoupleProvider` d'`agenda` -> son `PairedCouplePrismaProvider`).
- `src/modules/messaging/` : fil des mots flash, des photos instantanees et de la photo du jour (stub `CLAUDE.md`). `MessagingModule` : huit controleurs (`ApiRouterEnum.MESSAGE_FEED_GET`, `FLASH_MESSAGE_*`, `INSTANT_PHOTO_*`, `PHOTO_PROMPT_*`) et la tache planifiee `PhotoPromptScheduler` (un passage par minute, coupee par `PHOTO_PROMPT_SCHEDULER_ENABLED=false`, `env.ts` du module), tous sous `@UseGuards(MessagingCoupleGuard)` (`primary/couple/`, copie du garde d'`agenda`) ; l'envoi d'une photo passe par `primary/upload/` (multer en memoire, borne `INSTANT_PHOTO_MAX_BYTES`, 413 de multer rendu en 422). Puis `MessagingServiceModule` (use cases par `messagingUseCase()`, `MessagingCoupleGuardService` en provider), `MessagingSecondaryModule` (`FlashMessageRepository`, `InstantPhotoRepository`, `PhotoPromptRepository`, `PairedCoupleProvider` de `messaging`) ; `FileStorage` vient du `StorageModule` global. Notifications (R10, R11) : trois controleurs `PUSH_SUBSCRIPTION_*` (abonner un telephone en `PUT`, l'oublier, lire la cle publique VAPID), le relais de l'outbox `OutboxRelayScheduler` (un passage toutes les cinq secondes, coupe par `OUTBOX_RELAY_ENABLED=false`) et l'envoi Web Push `WebPushNotificationSender` (paquet `web-push`, cles `WEB_PUSH_VAPID_*` de l'`env.ts` du module).
- Un nouveau contexte : `src/modules/<contexte>/`, sur le modele de `pairing`, avec son stub `CLAUDE.md` qui importe le `CLAUDE.md` du contexte metier.

## A lire avant de commencer

Regles backend communes :
@../../../_knowledge/core-backend.md

Adaptateurs primaires et secondaires, structure d'un module de contexte :
@../../../_knowledge/backend/adapters.md

Contrats Zod et codes d'exception :
@../../../_knowledge/backend/contracts.md

Bootstrap, environnement, modules globaux :
@../../../_knowledge/backend/wiring.md

Controleurs, garde de session, validation :
@../../../_knowledge/backend/controllers.md

Harnais et specs E2E :
@../../../_knowledge/backend/e2e.md

Transactions et verrous : `../../../_knowledge/backend/concurrency.md`.

## Consignes de code

- Toute valeur de configuration se lit par `configService.getOrThrow('NOM', { infer: true })` sur un `ConfigService<Environment, true>`, jamais `.get()` ni `process.env`. Un module de package recoit ses options par `forRootAsync({ inject: [ConfigService], useFactory })`, la fabrique va dans `src/config/`.
- Nouvelle variable : le schema (`src/env.ts` ou le `env.ts` d'un module qu'il compose), `.env.example` commente avec une valeur dev, et la lecture par `getOrThrow`, dans le meme commit.
- Guards, filtre et middleware se declarent dans `AppModule` (`APP_GUARD`, `APP_FILTER`, `configure()`), jamais dans `main.ts` : l'app E2E importe `AppModule` et doit tourner sur la meme chaine qu'en production.
- Un code d'exception nouveau entre dans `EXCEPTION_STATUSES`, ou dans la liste `INTERNAL_CODES` de `exception-statuses.spec.ts` s'il doit repondre 500 ; son enum entre dans `EVERY_CODE_ENUM` de la spec.
- Une route est privee par defaut : `@Public()` (`@cocooning/server-infrastructure/nest`) seulement pour la sante et la connexion. Le controleur recoit l'identite par `@CurrentPartner()`, jamais par le corps ni la query (`core-backend.md` regle 5).
- Ne jamais logger le cookie, le jeton ni un corps de requete (`core.md` regles 30 et 33).
- Une route vient de `ApiRouterEnum` (`@cocooning/couple-shared-kernel/routers`), jamais une chaine en dur.
- Modeles a copier : `src/health/health.controller.ts` (controleur), `src/config/prisma-options.factory.ts` (options lues par `ConfigService`).

## Tests

- Specs unitaires `src/**/*.spec.ts` : `pnpm --filter couple-api test`. Jest lit tous les packages `@cocooning/*` dans leurs `src` (`moduleNameMapper` de `jest.config.mjs`).
- E2E `test/<contexte>/*.e2e-spec.ts` : `pnpm --filter couple-api test:e2e` (Docker requis). `test/e2e/jest-e2e.config.mjs` branche le setup global de `@cocooning/couple-e2e-shared` (Postgres 17 migre, `DATABASE_POSTGRES_URL`) et le seul module d'environnement de test, `test/shared/env/test-environment.ts` (variables et `Uuid.configure`).
- `createTestApp({ controllers, overrides })` (`test/shared/app/create-test-app.ts`) monte le vrai `AppModule` et `listen(0)` ; `closeTestApp` ferme l'app, qui deconnecte Prisma. `TestClient.for(app)` envoie les requetes par `fetch` (`postForm` pour un envoi `multipart/form-data`, `getFile` pour lire des octets) ; `asPartner(userId, now)` signe un cookie de session HS256 avec le secret de test, a la version de session 1 : le garde charge le compte, que la spec pose par `createTestAccount` (`PairingTestApp.reset()` pose ceux des partenaires).
- Un controleur de test est une fixture de la spec (exemple : `test/authentication/partner-probe.controller.ts`). Pas de `jest.fn` ni `jest.spyOn` (decision 0001) : une horloge se remplace par `overrides` avec `DeterministicDateTimeProvider`.
- Une spec qui ecrit en base vide les tables par `truncateAllTables` (`@cocooning/couple-e2e-shared/fixtures`) en `beforeEach`.
- Modele a copier : `test/health/health.e2e-spec.ts` (route simple), `test/authentication/` (garde, connexion, `AuthenticationTestApp`), `test/pairing/` (contexte : `PairingTestApp` monte l'app sur une horloge deterministe, une spec par endpoint, `pairing-concurrency.e2e-spec.ts`, specs de l'adaptateur par `app.get(CoupleRepository)` sur des lignes posees par `createTestCouple`).
- `readPairingEvents`, `readNoteEvents`, `readAgendaEvents`, `readMessagingEvents`, `readPushSubscriptions`, `createTestCouple`, `createTestNotes`, `createTestFolders`, `createTestCalendarEvents`, `createTestCalendarLabels`, `createTestFlashMessages`, `createTestInstantPhotos` et `createTestAccount` viennent de `@cocooning/couple-e2e-shared/fixtures`, jamais d'un helper local.

## Pieges

- A l'execution, l'API lit le `dist/` des packages : `turbo` les construit avant (`^build`). Lancer `pnpm --filter couple-api... build` apres un changement dans un package hors `turbo dev`.
- Un `POST` repond 201 par defaut : une action qui ne cree rien (rejoindre, renouveler) pose `@HttpCode(HttpStatus.OK)`.
- Une `CoupleView` porte des `Date` et `CoupleResponseSchema` des chaines : le controleur renvoie `toCoupleResponse(view)`, sinon `ZodResponse` repond 500.
- Express 5 : une route joker s'ecrit `{*path}` (path-to-regexp 8).
- `@nestjs/config` 12 et `@nestjs/jwt` 12 sont en ESM pur : rester en 4 et 11.
- `jsonwebtoken` et `argon2` : voir les pieges de `src/modules/authentication/CLAUDE.md`.
- Hocuspocus 4 et Yjs ont une entree `require` mais des types ESM seuls : les charger par `src/modules/notes/esm-packages.ts` (`createRequire`), jamais par un `import` (TS1479). Un hook Hocuspocus qui echoue passe par `reportingFailure`, sinon Hocuspocus imprime l'erreur et sa pile.
- `@types/cookie-parser` type `request.cookies` en `any` : le relire en `Record<string, unknown>` et tester `typeof`.
- `ConfigModule` lit aussi `.env` du dossier courant ; `process.env` l'emporte sur le fichier.
- `web-push` reste en 3.6.7 (CommonJS, decision D31) : la 4 est en ESM pur. Son `WebPushError` porte l'adresse du telephone : ne jamais le journaliser, seulement son `statusCode`.
- Aucune spec n'appelle Gemini : `NotesTestApp` remplace `NoteCardWriter` par `FakeNoteCardWriter` (`test/notes/`) ; `GeminiInteractionsClient` se teste avec un `fetch` ecrit a la main. Ne jamais journaliser la cle, un prompt ni une reponse de l'IA : seulement l'operation et le statut.
- Aucune spec n'appelle Nominatim : `NotesTestApp` remplace `PlaceDirectory` par `FakePlaceDirectory` ; `NominatimPlaceDirectory` se teste avec un `fetch` ecrit a la main. Sa politique d'usage veut un `User-Agent` avec un contact : la valeur avec contact va dans `.env`, jamais dans le depot. Ne jamais journaliser la requete ni le lieu trouve.
- Aucune spec n'appelle un vrai service de notification : `MessagingTestApp` remplace `PushNotificationSender` par `FakePushNotificationSender` (`test/messaging/`).

## Commandes

- `pnpm --filter couple-api dev` (reconstruit et relance a chaque changement, lit `.env`)
- `pnpm --filter couple-api test`
- `pnpm --filter couple-api test:e2e`
- `pnpm --filter couple-api check-types`
- `pnpm --filter couple-api lint`
- `pnpm --filter couple-api build`
- `pnpm --filter couple-api create-account <adresse>` (apres `build`, lit `.env` ; en production : `docs/couple/infrastructure/runbooks/authentication/accounts.md`)
- `pnpm --filter couple-api record-together-periods <adresse> <debut>..<fin> <debut>..` (apres `build`, lit `.env` ; en production : `docs/couple/infrastructure/runbooks/pairing/together-periods.md`)

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/`.
- Demarrage local, variables d'environnement : `docs/guides/local-setup.md`.
- Garde de session, cookie, jeton : `docs/couple/architecture/authentication/index.md` et `_knowledge/backend/controllers.md`.
- Bootstrap, env, modules globaux, table des statuts : `_knowledge/backend/wiring.md`. Harnais E2E : `_knowledge/backend/e2e.md`.
- Table code -> statut : `docs/couple/decisions/0020-statut-http-des-exceptions.md` et le tableau des refus de `docs/couple/business-rules/<contexte>/rules.md`.
- Commande ajoutee (`src/commands/<commande>/`) : le `CLAUDE.md` de `src/commands/`, son runbook dans `docs/couple/infrastructure/runbooks/<contexte>/`, la carte du `CLAUDE.md` racine.
- Module de contexte ajoute (`src/modules/<contexte>/`, avec son stub `CLAUDE.md`) : `_knowledge/backend/adapters.md` (structure) et la carte de l'arborescence du `CLAUDE.md` racine.
