# Mise en couple

Cette page décrit comment le contexte `pairing` est construit : ses couches, ses use cases et la façon dont ses événements partent. À lire avant de modifier le code de `packages/couple/server-business-logic/src/pairing/` ou de `apps/couple/api/src/modules/pairing/`.

## Rôle et limites

`pairing` relie deux comptes en un couple : il crée le couple, délivre et renouvelle le code d'invitation, fait entrer le second partenaire et dit à un partenaire où en est son couple. Il ne connaît ni les mots de passe ni les sessions (`authentication`), et ne lit aucune donnée des notes, de l'agenda ou des messages. Quitter un couple n'existe pas encore.

Le contexte est construit de bout en bout : domaine et application, tables PostgreSQL (voir [les tables](tables.md)), contrat HTTP, adaptateur Prisma de `CoupleRepository` et quatre endpoints de l'API. C'est la référence que les contextes suivants copient.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Couple` | Agrégat : partenaires, statut, code d'invitation (voir [l'agrégat](aggregate.md)) | `domain/models/couple.aggregate.ts` |
| `CouplePartner` | Entité enfant : un `userId` et sa date d'arrivée | `domain/models/couple-partner.entity.ts` |
| `CoupleId`, `InvitationCode` | Value objects : identité UUID v7, code de 8 signes et son échéance | `domain/value-objects/` |
| `CouplePairingStatusEnum` | `PENDING`, `PAIRED`, partagé avec la PWA | `packages/couple/shared-kernel/src/enums/couple-pairing-status.enum.ts` |
| `PairingException` | Exception du contexte, codes de `PairingExceptionCodeEnum` | `domain/exceptions/`, `packages/couple/contract/src/pairing/exceptions/exception-codes.ts` |
| `CoupleRepository` | Port : `save`, `findByPartner`, `findByInvitationCode` | `domain/ports/couple.repository.ts` |
| `PairingPreconditionService` | Domain service : un partenaire sans couple (R1), le couple d'un partenaire, le couple d'un code | `domain/services/pairing-precondition.service.ts` |
| `CouplePairingValidator` | Contrôles statiques appelés par l'agrégat | `domain/services/couple-pairing.validator.ts` |
| `CreateCoupleUseCase`, `JoinCoupleUseCase`, `RenewInvitationCodeUseCase`, `GetMyCoupleUseCase` | Use cases, `execute(context)` ou `execute(context, command)` | `application/use-cases/` |
| Tables `couple`, `couple_partner`, `pairing_event` | Persistance de l'agrégat et outbox (voir [les tables](tables.md)) | `packages/couple/prisma/prisma/models/pairing-*.prisma` |
| `JoinCoupleRequestSchema`, `CoupleResponseSchema` | Contrat HTTP partagé par l'API et la PWA : le code saisi, et le corps commun aux quatre actions, miroir de `CoupleView` | `packages/couple/contract/src/pairing/schemas/` |
| `toCoupleView` | Vue rendue par les quatre use cases : identifiant, statut, partenaires, code ou `null` | `application/mappers/couple-view.mapper.ts` |
| Contrôleurs | Un par endpoint, méthode `handle()`, partenaire lu par `@CurrentPartner()` | `apps/couple/api/src/modules/pairing/primary/controllers/` |
| `toCoupleResponse` | `CoupleView` vers `CoupleResponseSchema`, dates en chaînes ISO | `apps/couple/api/src/modules/pairing/primary/mappers/` |
| `CouplePrismaRepository` | Adaptateur de `CoupleRepository` : couple, partenaires et outbox dans une transaction, verrou optimiste, contraintes uniques traduites par leur nom | `apps/couple/api/src/modules/pairing/secondary/repositories/` |
| `PairingModule`, `PairingServiceModule`, `PairingSecondaryModule` | Contrôleurs ; use cases construits par `pairingUseCase()` ; `provide: CoupleRepository` | `apps/couple/api/src/modules/pairing/` |

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/pairing/`.

## Endpoints

Toutes les routes demandent une session (cookie `cocooning_session`, [décision 0030](../../decisions/0030-verification-du-jwt-en-phase-2.md)) ; sans elle, `401`. Le corps de chaque réponse réussie suit `CoupleResponseSchema`.

| Route | Clé de `ApiRouterEnum` | Use case | Succès | Refus |
|---|---|---|---|---|
| `POST /pairing/couple` | `COUPLE_CREATE` | `CreateCoupleUseCase` | `201`, couple `PENDING` et son code | `409` `PAIRING_PARTNER_ALREADY_IN_COUPLE` |
| `POST /pairing/couple/join`, corps `JoinCoupleRequestSchema` | `COUPLE_JOIN` | `JoinCoupleUseCase` | `200`, couple `PAIRED`, plus de code | `422` corps invalide ou `PAIRING_INVITATION_CODE_INVALID` ; `409` `PAIRING_PARTNER_ALREADY_IN_COUPLE` ou `PAIRING_COUPLE_VERSION_CONFLICT` |
| `POST /pairing/couple/invitation-code` | `COUPLE_INVITATION_CODE_RENEW` | `RenewInvitationCodeUseCase` | `200`, nouveau code | `404` `PAIRING_COUPLE_NOT_FOUND` ; `409` `PAIRING_COUPLE_ALREADY_PAIRED` |
| `GET /pairing/couple` | `COUPLE_GET_MINE` | `GetMyCoupleUseCase` | `200` | `404` `PAIRING_COUPLE_NOT_FOUND` |

## Flux principal

De la requête à l'outbox : le contrôleur lit le partenaire (`@CurrentPartner()`) et le corps validé par `ZodValidationPipe`, appelle le use case, puis renvoie `toCoupleResponse(view)`, que `ZodResponse(CoupleResponseSchema)` filtre. Le use case charge et sauvegarde par `CoupleRepository`, que `CouplePrismaRepository` réalise ; `EventPublishingService` publie ensuite par `InProcessEventPublisher`, qui ne fait que journaliser tant qu'aucun abonné n'existe.


Rejoindre un couple (`JoinCoupleUseCase`) :

1. `PairingPreconditionService.ensurePartnerHasNoCouple(userId)` refuse un partenaire déjà dans un couple, y compris le sien (R1, `PAIRING_PARTNER_ALREADY_IN_COUPLE`).
2. `InvitationCode.normalize` retire les espaces, passe en majuscules et refuse ce qui n'a pas la forme d'un code (R3).
3. `loadCoupleByInvitationCode` charge le couple du code, ou refuse (R6, `PAIRING_INVITATION_CODE_INVALID`).
4. `Couple.join` vérifie le code et son échéance, ajoute le partenaire, passe à `PAIRED`, retire le code et enregistre `CouplePairedEvent` (R5).
5. `CoupleRepository.save` écrit l'état et l'événement dans une même transaction (outbox, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)) : `CouplePrismaRepository` ouvre l'unité de travail, lit le couple (`findFirst`), le crée en version 1 ou le met à jour par `updateMany` filtré sur la version lue, réécrit ses partenaires (`deleteMany` puis `createMany`), puis ajoute les lignes de `pairing_event` à la suite de la dernière version de l'agrégat, lue dans la même transaction.
6. `EventPublishingService.publishAndClear` publie l'événement dans le processus ; un échec est journalisé et le relais de l'outbox livre plus tard.

Les trois autres use cases suivent la même recette. La durée de validité du code arrive par le constructeur de `CreateCoupleUseCase` et `RenewInvitationCodeUseCase` (`invitationCodeLifetimeInHours`), lue par l'API dans `PAIRING_INVITATION_CODE_TTL_HOURS`.

## Points d'attention

- **Recherches sans `coupleId`.** Les use cases reçoivent `PartnerContext = { userId }`, et `CoupleRepository.findByPartner(userId)` et `findByInvitationCode(code)` sont les deux seules exceptions du dépôt à la règle 27 de `_knowledge/core.md` ([décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md)). Chacune répond au plus un couple, car `save` refuse un partenaire ou un code déjà pris ; aucun autre contexte ne les copie.
- **Le code est un secret.** Aucun événement ne le porte : `InvitationCodeRenewedEvent` n'a pas de données.
- **Concurrence.** Deux partenaires qui saisissent le même code en même temps : le second `save` échoue sur la version (`PAIRING_COUPLE_VERSION_CONFLICT`, `409`), car son `updateMany` attend le verrou de ligne puis ne trouve plus la version lue ; s'il ne lit le couple qu'après la validation du premier, le code a disparu et il reçoit `PAIRING_INVITATION_CODE_INVALID` (`422`). Vérifié en E2E par `apps/couple/api/test/pairing/pairing-concurrency.e2e-spec.ts`. Deux couples créés en même temps par le même partenaire : la contrainte unique du partenaire répond `PAIRING_PARTNER_ALREADY_IN_COUPLE`. Un code tiré deux fois : `PAIRING_INVITATION_CODE_CONFLICT`. L'adaptateur traduit les contraintes par leur nom (`violatedUniqueConstraint`) : `couple_partner_user_id_key`, `couple_invitation_code_key`, et `pairing_event_aggregate_id_version_key` comme un conflit de version.
- Les tests de use case s'appuient sur `CoupleInMemoryRepository`, qui reproduit la version et les deux index uniques ; la base réelle se vérifie en E2E (`apps/couple/api/test/pairing/`), y compris l'adaptateur seul, par `app.get(CoupleRepository)`.

## Décisions liées

- [Décision 0022](../../decisions/0022-mise-en-couple-par-code-d-invitation.md) : un compte par personne, mise en couple par code
- [Décision 0028](../../decisions/pairing/0028-regles-du-code-d-invitation.md) : règles du code d'invitation
- [Décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md) : le contexte travaille avant qu'un couple existe
- [Décision 0023](../../decisions/0023-forme-des-use-cases-et-des-reactions.md) : forme des use cases
