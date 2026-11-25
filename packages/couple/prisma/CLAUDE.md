# @cocooning/couple-prisma

Persistance du domaine couple : schema Prisma 7 eclate en un fichier par modele (`prisma/models/`), migrations (`prisma/migrations/`), `PrismaService` (client cree a `onModuleInit`, `transaction()` reentrant, `current`, `includingDeleted`), `PrismaModule.forRoot()` et `forRootAsync({ inject, useFactory })`, `PrismaUnitOfWork` (port `UnitOfWork`), extension de suppression logique opt-in, helper d'unicite `violatedUniqueConstraint`, verrou consultatif transactionnel, schema Zod d'environnement.

Modeles : `pairing` (`Couple`, `CouplePartner`, outbox `PairingEvent`), crees par la migration `20261122233413_init` (colonne `together_periods` par `pairing_together_periods`), tables decrites dans `docs/couple/architecture/pairing/tables.md` ; `authentication` (`Account`, sans `coupleId` ni outbox), cree par `20261123131843_authentication_account`, table decrite dans `docs/couple/architecture/authentication/tables.md` ; `notes` (`Note`, `Folder`, `NoteCard`, outbox `NoteEvent`), cree par `20261123194115_notes_note` (colonne `content_state` par `notes_content_state` ; `folder` et `note.folder_id` par `20261125100000_notes_folders`, `folder.kind`, `subject` et `card_template` par `20261125200000_notes_smart_folders`, `note_card` par `20261125210000_notes_note_card`, leur index par `20261125100100_notes_note_folder_index`, seul dans sa migration pour `CREATE INDEX CONCURRENTLY`), tables decrites dans `docs/couple/architecture/notes/tables.md` ; `agenda` (`CalendarEvent`, outbox `AgendaEvent`), cree par `20261124133221_agenda_calendar_event` (colonne `audience` par `20261125230000_agenda_calendar_event_audience`, remplie depuis `visibility`), tables decrites dans `docs/couple/architecture/agenda/tables.md` ; `messaging` (`FlashMessage`, `InstantPhoto`, `PhotoPrompt`, `PushSubscription`, outbox `MessagingEvent`), cree par `20261124200000_messaging_feed` (`photo_prompt`, `instant_photo.photo_prompt_id` et `is_late` par `20261124230000_messaging_photo_prompt` ; `push_subscription` par `20261124234500_messaging_push_subscription`, qui marque aussi publies les evenements deja ecrits de `note_event`, `agenda_event` et `messaging_event`, decision 0051), tables decrites dans `docs/couple/architecture/messaging/tables.md`.

## A lire avant de commencer

Conventions Prisma, migrations, seeds :
@../../../_knowledge/backend/prisma.md

Transactions, verrou optimiste, verrous consultatifs :
@../../../_knowledge/backend/concurrency.md

## Consignes de code

- Aucune configuration lue dans `src/` : l'API passe l'URL et les delais de transaction a `PrismaModule.forRootAsync()`, lus par `ConfigService.getOrThrow()` dans son `env.ts` valide, qui compose `couplePrismaEnvSchema` (`src/env.ts`). Seul `prisma.config.ts` lit `DATABASE_POSTGRES_URL`, pour la CLI.
- Un modele avec `deletedAt` entre dans `SOFT_DELETABLE_MODELS` dans le meme changement (la spec `soft-deletable-models.spec.ts` echoue sinon).
- Aucune ligne SQL n'interpole une valeur : `$queryRaw` et `$executeRaw` tagues uniquement.
- Modeles a copier : `prisma/models/pairing-couple.prisma` (agregat a suppression logique), `prisma/models/pairing-couple-partner.prisma` (enfant), `prisma/models/pairing-event.prisma` (outbox), `src/locks/acquire-transactional-advisory-lock.ts` (SQL brut tague dans la transaction courante), `src/errors/violated-unique-constraint.ts` (lecture d'une erreur Prisma 7).

## Tests

- Specs unitaires (`*.spec.ts`) : `pnpm --filter @cocooning/couple-prisma test`, sans base.
- Specs d'integration (`*.integration-spec.ts`) contre un vrai Postgres 17 : `pnpm --filter @cocooning/couple-prisma test:integration`, qui lit `DATABASE_POSTGRES_URL` dans `.env` (copier `.env.example`). Elles creent puis suppriment leur propre table.

## Pieges

- Prisma 7 n'expose pas de DMMF a l'execution : la liste des modeles a suppression logique est declaree, et verifiee par la spec.
- Une erreur Prisma 7 porte la cause Postgres dans `meta.driverAdapterError.cause` (`kind`, `code` ou `originalCode`, `constraint.index`), en `P2002` comme en `P2010` : passer par `driverAdapterCauseOf`, jamais lire `meta.target`.
- `$queryRaw` ne sait pas deserialiser une colonne `void` (`SELECT pg_advisory_xact_lock(...)`) : utiliser `$executeRaw`.
- Un verrou occupe (`55P03`) annule la transaction : la laisser echouer.
- Un index partiel (unicite tolerante a la suppression) s'ecrit a la main dans le SQL de la migration : `couple_invitation_code_key`, `account_email_address_key` et `instant_photo_couple_id_photo_prompt_id_owner_id_key` en sont. Prisma 7.10 ne le supprime pas dans les migrations suivantes, mais chaque migration generee se relit quand meme.
- Un commentaire `///` d'un modele ne contient pas d'accolade : `soft-deletable-models.spec.ts` lit chaque bloc `model` jusqu'a la premiere `}`.
- L'extension de suppression douce filtre aussi le `findFirst` d'un repository dans sa transaction : une sauvegarde perimee d'une ligne supprimee entre-temps la croit absente et tente un `create`, qui heurte la cle primaire. Les repositories de `messaging` traduisent cette collision (`flash_message_pkey`, `instant_photo_pkey`) en `*_VERSION_CONFLICT`.
- `CouplePartner` n'a pas de `deletedAt` : sa contrainte `couple_partner_user_id_key` ne voit pas la suppression logique du couple.
- Le scope de transaction (`AsyncLocalStorage`) est global au module, pas propre a une instance : deux `PrismaService` d'un meme process (tests seulement) se rejoignent. Du code lance dans la transaction d'une instance voit `isInTransaction` vrai sur l'autre et ecrit dans cette transaction.
- Le tag `latest` de `prisma` pointe vers une RC de la v8 : rester sur `^7.10.1`.

## Commandes

Toujours passer par les scripts du package (`pnpm --filter @cocooning/couple-prisma <script>`) : `db:generate`, `db:format`, `db:migrate` (`migrate dev`), `db:deploy`, `db:reset`, `test`, `test:integration`, `check-types`, `lint`, `build`. Les scripts `db:*` qui touchent la base lisent `.env` du package.

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le modele, la table ou le fichier modifies, trouvee avec `rg -l '<NomDuModele>|<nom_de_table>|<chemin/du/fichier>' docs/ _knowledge/`.
- Table ajoutee, modifiee ou retiree : `docs/couple/architecture/<contexte>/tables.md` dans le meme commit (`docs/CLAUDE.md`).
- `PrismaService`, unite de travail, verrou : `_knowledge/backend/concurrency.md`. Extension, conventions, chemins : `_knowledge/backend/prisma.md`.
