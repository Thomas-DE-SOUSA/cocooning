# @cocooning/shared-kernel

Primitives DDD sans domaine (`AggregateRoot`, `Entity`, `ValueObject`, `DomainEventBase`, `Uuid`, `EventId`, `EntityMetadata`), types transverses (`ExecutionContext`, `PartnerContext` reserve a `pairing` par la decision 0029, pagination), ports d'infrastructure (`DateTimeProvider`, `UuidGenerator`, `SecureRandomGenerator`, `Logger`, `EventPublisher`, `UnitOfWork`, `FileStorage`), `EventPublishingService`, `BaseException`, `parseEnum`, `isCalendarDay` (jour `YYYY-MM-DD` reel) et `Result` (`ok`, `fail`, partage par les packages front). Le sous-chemin `testing` porte les fakes partages, hors build.

## A lire avant de commencer

Contenu des deux shared kernels et regles d'ajout :
@../../_knowledge/backend/shared-kernel.md

Regles backend communes :
@../../_knowledge/core-backend.md

## Consignes de code

- Aucune dependance runtime, aucun framework, aucune API Node : le package est importe par l'API et par la PWA.
- Exports par sous-chemin uniquement (`domain`, `ports`, `exceptions`, `application`, `utils`, `testing`), pas d'export racine. `types` pointe vers `src`, `default` vers `dist` ; `testing` pointe vers `src` et n'est jamais compile.
- Un port = une classe abstraite dans son dossier `src/ports/<sujet>/`. Un fake = une classe en `extends` du port dans `src/testing/` (decision 0001).
- Une erreur du package est une `SharedKernelException` avec un code de `SharedKernelExceptionCodeEnum`, jamais un `Error`.
- Modeles a copier : `src/domain/value-objects/event-id.vo.ts` (VO d'identite), `src/domain/value-objects/entity-metadata.vo.ts` (VO avec snapshot), `src/testing/fake-event-publisher.adapter.ts` (fake).

## Tests

- Une spec `*.spec.ts` a cote du fichier, style BDD (`Feature:`, `Scenario:`), sans `should`.
- Toute spec qui tire un identifiant pose `EventId.configure(new FakeUuidV7GeneratorProvider())` dans `beforeEach` et appelle `EventId.resetForTests()` dans `afterEach`.

## Pieges

- `Uuid.configure` est un etat global du process : sans `resetForTests()`, un second `configure` leve `UUID_GENERATOR_ALREADY_CONFIGURED`.
- Le vrai generateur UUID v7 n'est pas ici : il vit dans `@cocooning/server-infrastructure` (`identifier/`), seul package qui depend de `uuid`.
- `uuid` 12 et plus est en ESM pur : Jest et NestJS tournent en CommonJS. Garder `uuid` 11 tant que ce n'est pas tranche.
- Jest compile avec `tsconfig.spec.json` (CommonJS) ; `check-types` et le build gardent `Node16`.

## Commandes

- `pnpm --filter @cocooning/shared-kernel test`
- `pnpm --filter @cocooning/shared-kernel check-types`
- `pnpm --filter @cocooning/shared-kernel lint`
- `pnpm --filter @cocooning/shared-kernel build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Primitive, port, type ou fake ajoute, retire ou renomme : les tables de `_knowledge/backend/shared-kernel.md`.
- `Uuid`, `EventId`, `DateTimeProvider` : `docs/couple/decisions/0024-determinisme-horloge-et-identifiants.md` (decision acceptee : une nouvelle decision si le choix change) et la regle 19 de `_knowledge/core.md`.
- `EventPublishingService` : regle 21 de `_knowledge/core-backend.md`.
- Pagination : `docs/couple/decisions/0025-pagination.md`.
