# @cocooning/couple-prisma

Persistance du domaine couple : schema Prisma 7 eclate en un fichier par modele (`prisma/models/`), migrations (`prisma/migrations/`), `PrismaService` (client cree a `onModuleInit`, `transaction()` reentrant, `current`, `includingDeleted`), `PrismaModule.forRoot()` et `forRootAsync({ inject, useFactory })`, `PrismaUnitOfWork` (port `UnitOfWork`), extension de suppression logique opt-in, helper d'unicite `violatedUniqueConstraint`, verrou consultatif transactionnel, schema Zod d'environnement.

Modeles : `pairing` (`Couple`, `CouplePartner`, outbox `PairingEvent`), crees par la migration `20261122233413_init`, tables decrites dans `docs/couple/architecture/pairing/tables.md` ; `authentication` (`Account`, sans `coupleId` ni outbox), cree par `20261123131843_authentication_account`, table decrite dans `docs/couple/architecture/authentication/tables.md` ; `notes` (`Note`, outbox `NoteEvent`), cree par `20261123194115_notes_note`, tables decrites dans `docs/couple/architecture/notes/tables.md`.

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
- Un index partiel (unicite tolerante a la suppression) s'ecrit a la main dans le SQL de la migration : `couple_invitation_code_key` et `account_email_address_key` en sont. Prisma 7.10 ne le supprime pas dans les migrations suivantes, mais chaque migration generee se relit quand meme.
- `CouplePartner` n'a pas de `deletedAt` : sa contrainte `couple_partner_user_id_key` ne voit pas la suppression logique du couple.
- Le scope de transaction (`AsyncLocalStorage`) est global au module, pas propre a une instance : deux `PrismaService` d'un meme process (tests seulement) se rejoignent. Du code lance dans la transaction d'une instance voit `isInTransaction` vrai sur l'autre et ecrit dans cette transaction.
- Le tag `latest` de `prisma` pointe vers une RC de la v8 : rester sur `^7.10.1`.

## Commandes

Toujours passer par les scripts du package (`pnpm --filter @cocooning/couple-prisma <script>`) : `db:generate`, `db:format`, `db:migrate` (`migrate dev`), `db:deploy`, `db:reset`, `test`, `test:integration`, `check-types`, `lint`, `build`. Les scripts `db:*` qui touchent la base lisent `.env` du package.

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le modele, la table ou le fichier modifies, trouvee avec `rg -l '<NomDuModele>|<nom_de_table>|<chemin/du/fichier>' docs/ _knowledge/`.
- Table ajoutee, modifiee ou retiree : `docs/couple/architecture/<contexte>/tables.md` dans le meme commit (`docs/CLAUDE.md`).
- `PrismaService`, unite de travail, verrou : `_knowledge/backend/concurrency.md`. Extension, conventions, chemins : `_knowledge/backend/prisma.md`.
