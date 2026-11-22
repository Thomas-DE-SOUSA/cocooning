# Mise en couple

Cette page décrit comment le contexte `pairing` est construit : ses couches, ses use cases et la façon dont ses événements partent. À lire avant de modifier le code de `packages/couple/server-business-logic/src/pairing/`.

## Rôle et limites

`pairing` relie deux comptes en un couple : il crée le couple, délivre et renouvelle le code d'invitation, fait entrer le second partenaire et dit à un partenaire où en est son couple. Il ne connaît ni les mots de passe ni les sessions (`authentication`), et ne lit aucune donnée des notes, de l'agenda ou des messages. Quitter un couple n'existe pas encore.

Les couches domaine et application existent, ainsi que les tables PostgreSQL (voir [les tables](tables.md)) et les schémas du contrat HTTP. L'adaptateur Prisma de `CoupleRepository` et les contrôleurs de l'API arrivent dans les étapes suivantes de la phase 2.

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

Les chemins sans préfixe partent de `packages/couple/server-business-logic/src/pairing/`.

## Flux principal

Rejoindre un couple (`JoinCoupleUseCase`) :

1. `PairingPreconditionService.ensurePartnerHasNoCouple(userId)` refuse un partenaire déjà dans un couple, y compris le sien (R1, `PAIRING_PARTNER_ALREADY_IN_COUPLE`).
2. `InvitationCode.normalize` retire les espaces, passe en majuscules et refuse ce qui n'a pas la forme d'un code (R3).
3. `loadCoupleByInvitationCode` charge le couple du code, ou refuse (R6, `PAIRING_INVITATION_CODE_INVALID`).
4. `Couple.join` vérifie le code et son échéance, ajoute le partenaire, passe à `PAIRED`, retire le code et enregistre `CouplePairedEvent` (R5).
5. `CoupleRepository.save` écrit l'état et l'événement dans une même transaction (outbox, [décision 0021](../../decisions/0021-outbox-postgresql-relais-dans-l-api.md)).
6. `EventPublishingService.publishAndClear` publie l'événement dans le processus ; un échec est journalisé et le relais de l'outbox livre plus tard.

Les trois autres use cases suivent la même recette. La durée de validité du code arrive par le constructeur de `CreateCoupleUseCase` et `RenewInvitationCodeUseCase` (`invitationCodeLifetimeInHours`), lue par l'API dans `PAIRING_INVITATION_CODE_TTL_HOURS`.

## Points d'attention

- **Recherches sans `coupleId`.** Les use cases reçoivent `PartnerContext = { userId }`, et `CoupleRepository.findByPartner(userId)` et `findByInvitationCode(code)` sont les deux seules exceptions du dépôt à la règle 27 de `_knowledge/core.md` ([décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md)). Chacune répond au plus un couple, car `save` refuse un partenaire ou un code déjà pris ; aucun autre contexte ne les copie.
- **Le code est un secret.** Aucun événement ne le porte : `InvitationCodeRenewedEvent` n'a pas de données.
- **Concurrence.** Deux partenaires qui saisissent le même code en même temps : le second `save` échoue sur la version (`PAIRING_COUPLE_VERSION_CONFLICT`). Deux couples créés en même temps par le même partenaire : la contrainte unique du partenaire répond `PAIRING_PARTNER_ALREADY_IN_COUPLE`. Un code tiré deux fois : `PAIRING_INVITATION_CODE_CONFLICT`.
- Les tests de use case s'appuient sur `CoupleInMemoryRepository`, qui reproduit la version et les deux index uniques ; la base réelle se vérifie en E2E.

## Décisions liées

- [Décision 0022](../../decisions/0022-mise-en-couple-par-code-d-invitation.md) : un compte par personne, mise en couple par code
- [Décision 0028](../../decisions/pairing/0028-regles-du-code-d-invitation.md) : règles du code d'invitation
- [Décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md) : le contexte travaille avant qu'un couple existe
- [Décision 0023](../../decisions/0023-forme-des-use-cases-et-des-reactions.md) : forme des use cases
