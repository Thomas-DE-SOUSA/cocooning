# @cocooning/couple-server-business-logic

Couches domaine et application des bounded contexts du couple, en TypeScript pur : agregats, value objects, evenements, exceptions, ports, domain services, use cases et mappers. Un sous-chemin d'export par contexte (`./pairing`), pas d'export racine. Les adaptateurs (Prisma, NestJS) vivent dans `apps/couple/api`.

## A lire avant de commencer

Regles backend communes :
@../../../_knowledge/core-backend.md

Modele de domaine :
@../../../_knowledge/backend/domain.md

Couche application :
@../../../_knowledge/backend/application.md

Tests de use case :
@../../../_knowledge/backend/use-case-tests.md

Shared kernels, a consulter avant de creer une primitive, un port ou un enum :
@../../../_knowledge/backend/shared-kernel.md

Selon la tache : `_knowledge/backend/concurrency.md` (version, contraintes uniques), `_knowledge/backend/contracts.md` (codes d'exception), `_knowledge/backend/adapters.md` (ce que fera l'adaptateur d'un port).

## Consignes de code

- Aucun import de `@nestjs/*`, `@prisma/*` ni d'un package `*-prisma` : ESLint `boundaries` le bloque. Dependances runtime : `@cocooning/shared-kernel`, `@cocooning/couple-shared-kernel`, `@cocooning/couple-contract` (codes d'exception seulement).
- Aucune lecture d'environnement : une valeur de configuration arrive par le constructeur du use case, lue par l'API.
- Un contexte = un dossier `src/<contexte>/` et une entree `exports` dans `package.json` (`types` vers `src`, `default` vers `dist`). Sans elle, le contexte n'est pas importable.
- Modeles a copier : `src/pairing/domain/models/couple.aggregate.ts` (agregat), `src/pairing/domain/value-objects/invitation-code.vo.ts` (VO), `src/pairing/domain/events/couple-paired.event.ts` (evenement), `src/pairing/application/use-cases/join-couple.use-case.ts` (use case).

## Tests

- Une spec par use case, a cote de lui, style BDD (`Feature:`, `Scenario:`), sans `should`. Fakes ecrits a la main en `extends` du port (decision 0001), jamais `jest.fn`.
- Chaque `<Contexte>TestContext` pose `Uuid.configure` dans son constructeur ; chaque spec appelle `<Id>.resetForTests()` dans `afterEach`.
- `__tests__/` est hors build : rien de `src/` hors specs ne l'importe.

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Agregat, invariant, evenement ou port modifie : `docs/couple/architecture/<contexte>/aggregate.md` (table `INV-NNN`) et `index.md`, dans le meme commit.
- Terme metier ajoute ou renomme : `docs/couple/business-rules/<contexte>/glossary.md` (ou `docs/architecture/glossary.md` s'il est transverse) avant le code.
- Classe ou methode citee par une regle renommee : la ligne « Dans le code » de `docs/couple/business-rules/<contexte>/rules.md`.
- Code d'exception ajoute ou retire : le contrat (`packages/couple/contract/src/<contexte>/exceptions/`), la table « Cas et exceptions » des regles et la table code -> statut de l'API.
- Ecart constate et non corrige : une entree a la fin de `docs/couple/gaps/<contexte>.md` (modele `docs/templates/gap-entry.md`).
- Forme d'un agregat, d'un use case ou d'un test changee pour tous : le canon de `_knowledge/backend/` concerne.

## Avant de changer une regle metier

1. Dire la regle avant et apres, en citant son numero `R<n>` de `rules.md`.
2. Demander au proprietaire sa nature (metier, produit, technique) et qui l'a validee.
3. Ecrire une decision `proposee` dans `docs/couple/decisions/<contexte>/` (modele `docs/templates/decision.md`), puis mettre a jour la ligne `Source` de la regle. Ne jamais inventer `validated-by` ni `Validee par`.
4. Changer le code et les tests seulement ensuite, dans le meme commit que la page de regles.

## Nouveau contexte

1. Le nom du contexte vient de `docs/architecture/context-map.md` et ses termes du glossaire ; un terme absent y est ajoute d'abord.
2. Copier l'anatomie de `src/pairing/` (`domain/{models,value-objects,events,exceptions,ports,services}`, `application/{use-cases,mappers}`, `__tests__/{builders,fixtures,secondary/adapters}`), un `index.ts` par dossier.
3. Codes d'exception dans `packages/couple/contract/src/<contexte>/exceptions/exception-codes.ts`, avec son entree `exports`.
4. Ajouter l'entree `exports` du contexte ici, son `CLAUDE.md` depuis `docs/templates/claude-server-submodule.md`, et ses pages `docs/couple/business-rules/<contexte>/` et `docs/couple/architecture/<contexte>/` dans le meme commit.
5. Un enum metier lu par la PWA va dans `@cocooning/couple-shared-kernel/enums`, sinon dans `domain/enums/`.

## Pieges

- `pairing` est le seul contexte sans `coupleId` : `PartnerContext` et les deux recherches de `CoupleRepository` (decision 0029). Ne jamais les copier dans un autre contexte.
- `Uuid.configure` est global au process : un oubli de `resetForTests()` fait lever `UUID_GENERATOR_ALREADY_CONFIGURED` au test suivant.
- Les fakes ne prouvent pas la base : index uniques et version se reverifient en E2E avec l'adaptateur Prisma.
- A l'execution, l'API lit `dist/` de ce package et de ses dependances : `pnpm build` a la racine reconstruit dans l'ordre.
- Jest compile avec `tsconfig.spec.json` (CommonJS) et lit les packages voisins dans leurs `src` (`moduleNameMapper`).

## Commandes

- `pnpm --filter @cocooning/couple-server-business-logic test`
- `pnpm --filter @cocooning/couple-server-business-logic exec jest --coverage`
- `pnpm --filter @cocooning/couple-server-business-logic check-types`
- `pnpm --filter @cocooning/couple-server-business-logic lint`
- `pnpm --filter @cocooning/couple-server-business-logic build`
