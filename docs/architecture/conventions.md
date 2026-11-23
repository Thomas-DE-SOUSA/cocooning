# Conventions

Cette page fixe les conventions d'architecture et de nommage communes à tout le dépôt : couches, packages, suffixes de fichiers, nommage des ports, des factories et des tests. À lire avant de créer un fichier. Les règles de code numérotées sont dans `_knowledge/core.md` (règles 34 à 38 pour le nommage) : cette page ne les recopie pas.

## Couches et packages

- Les packages sont nommés `@cocooning/couple-<couche>`, les applications `couple-<app>`. Les dossiers suivent le même schéma : `packages/couple/<couche>` et `apps/couple/<app>`.
- Les packages génériques n'ont pas de domaine : `@cocooning/shared-kernel`, `@cocooning/server-infrastructure`, `@cocooning/client-infrastructure`, `@cocooning/design-system`. Les configurations sont `@cocooning/ts-config`, `@cocooning/eslint-config`, `@cocooning/prettier-config`, `@cocooning/jest-config` (`config/`).
- Les noms de dossiers de contexte sont en kebab-case et repris à l'identique dans `docs/couple/`, `apps/couple/api/src/modules/` et `client-business-logic/src/`.
- Le sens des dépendances est donné dans la section « Dependency flow » du `CLAUDE.md` racine et vérifié par ESLint.

## Un suffixe par rôle

| Couche | Rôle | Suffixe |
|---|---|---|
| Domaine | Agrégat (et le type de son snapshot) | `.aggregate.ts` (`.type.ts`) |
| Domaine | Entité | `.entity.ts` |
| Domaine | Value object | `.vo.ts` |
| Domaine | Événement | `.event.ts` |
| Domaine | Exception | `.exception.ts` |
| Domaine | Port repository | `.repository.ts` |
| Domaine | Port provider (lecture d'un autre contexte) | `.provider.ts` |
| Domaine | Domain service | `.service.ts` |
| Domaine | Règle d'une chaîne de règles | `.rule.ts` |
| Application | Use case | `.use-case.ts` (`.use-case.spec.ts`) |
| Application | Guard service, service applicatif | `-guard.service.ts`, `.service.ts` |
| Application | Handler d'événement | `.handler.ts` |
| Application | Mapper | `.mapper.ts` |
| API | Contrôleur | `.controller.ts` |
| API | Modules NestJS d'un contexte | `.module.ts`, `-service.module.ts`, `-secondary.module.ts` |
| API | Repository et provider Prisma | `-prisma.repository.ts`, `-prisma.provider.ts` |
| API | Mapper Prisma, type de lecture, écriture d'un repository | `-prisma.mapper.ts`, `-prisma.payload.ts`, `-prisma.writer.ts` |
| API | Mapper de réponse, fabrique typée des use cases | `to-*-response.mapper.ts`, `-use-case.factory.ts` |
| API | Traduction des contraintes uniques d'un agrégat | `-unique-constraints.ts` |
| Contrat | Schéma de requête et de réponse | `.request.ts`, `.response.ts` |
| Front | Server action, gateway | `.action.ts`, `.gateway.ts` |
| Front | Presenter, view model | `.presenter.ts`, `.view-model.ts` |
| Front | Container, vue | `.container.tsx`, `.view.tsx` |
| Front | Hook | `use-*.ts` |
| Front | Schéma de formulaire | à trancher (D25) : `.zod.ts` ou `.schema.ts`, un seul pour toute l'app |
| Tests | Spec unitaire, E2E, intégration | `.spec.ts`, `.e2e-spec.ts`, `.integration-spec.ts` |
| Tests | Contexte de test, builder | `-test.context.ts`, `-input.builder.ts` |
| Tests | App E2E d'un contexte, données de test | `-test-app.ts`, `-test-data.ts` |
| Tests | Fake | `-in-memory.repository.ts`, `fake-*.provider.ts` ; fake d'un port transverse : `fake-*.adapter.ts`, `in-memory-*.ts`, `deterministic-*.provider.ts` |

Ne pas introduire de variante : `.types.ts`, `.error.ts` ou `.prisma-adapter.ts` n'existent pas dans ce dépôt.

## Ports, factories, value objects

- **Ports** : classes abstraites, sans préfixe `I`, nommées par la question posée (`PartnerProvider.findPartner`). `coupleId` est le premier paramètre de chaque méthode (D7).
- **Factories d'agrégat** : un verbe métier par variante (`Note.write()`, `FlashMessage.send()`), jamais un `create()` générique. Relecture par `fromSnapshot()`, sérialisation par `toSnapshot()`.
- **Value objects** : `create()` valide et normalise toute entrée externe ; `from()` hydrate depuis la base sans revalider, pour que des données anciennes se chargent même si la validation change.

## Erreurs et HTTP

- Le domaine ignore HTTP. Le filtre d'exceptions de l'API porte la table code d'exception vers statut HTTP, et une saisie invalide répond 422 (D5).
- Une donnée d'un autre couple, ou la donnée perso de l'autre partenaire, répond 404 (D7).
- Un nouvel en-tête HTTP n'a pas de préfixe `X-`.

## Tests

- Structure BDD : `describe('Feature: <use case>')`, puis `describe('Scenario: <situation>')`, puis `it('<comportement en langage métier>')`, sans `should`.
- Pas de mocks automatiques : des fakes écrits à la main, en `extends` du port (décision 0001).

## Fichiers de documentation

kebab-case, sans préfixe ni suffixe de type, sans majuscules sauf `CLAUDE.md` et `README.md` (`docs/CLAUDE.md`).

## Voir aussi

- [Glossaire](glossary.md)
- [Pourquoi cette architecture](why.md)
