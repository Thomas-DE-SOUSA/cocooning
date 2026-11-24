# Agrégat Couple

Cette page décrit l'agrégat `Couple` du contexte `pairing` : son état, ses transitions et les invariants qu'il garantit. À lire avant de toucher à `couple.aggregate.ts` ou à ses contrôles.

## Rôle et limites

`Couple` est l'objet pivot du domaine ([décision 0017](../../decisions/0017-couple-objet-pivot.md)) : son identifiant devient le `coupleId` de toutes les données du couple. L'agrégat porte ses partenaires, son statut, ses périodes ensemble (R9) et, tant qu'il attend le second partenaire, son code d'invitation. Il ne sait pas si un partenaire appartient à un autre couple : ce contrôle demande une lecture, il est fait par `PairingPreconditionService`, et le port `CoupleRepository` doit le garantir par une contrainte unique.

## Comment c'est construit

| Élément | Rôle | Chemin |
|---|---|---|
| `Couple.create(input, now)` | Le créateur devient le premier partenaire, statut `PENDING`, code reçu en entrée ; enregistre `CoupleCreatedEvent` | `domain/models/couple.aggregate.ts` |
| `Couple.join(partnerUserId, enteredCode, now)` | Ajoute le second partenaire, statut `PAIRED`, code retiré ; enregistre `CouplePairedEvent` | idem |
| `Couple.renewInvitationCode(partnerUserId, invitationCode, now)` | Remplace le code d'un couple en attente ; enregistre `InvitationCodeRenewedEvent` | idem |
| `Couple.cancel(partnerUserId, now)` | Supprime en douceur un couple en attente (`deletedAt`) ; enregistre `CoupleCancelledEvent` (R8) | idem |
| `Couple.recordTogetherPeriods(partnerUserId, togetherPeriods, now)` | Remplace les périodes ensemble d'un couple formé ; enregistre `TogetherPeriodsRecordedEvent` (R9) | idem |
| `Couple.fromSnapshot`, `toSnapshot` | Relecture sans validation, sérialisation en primitives et dates ISO, par `couplePropsFromSnapshot` et `coupleSnapshotFromProps` | idem, `domain/models/couple.aggregate.snapshot.ts` |
| `CouplePairingValidator` | `ensureMember`, `ensureNotMember`, `ensurePending`, `ensurePaired`, `ensureJoinableWith` | `domain/services/couple-pairing.validator.ts` |
| `InvitationCode` | `generate`, `from`, `normalize`, `isValidAt`, `matches` | `domain/value-objects/invitation-code.vo.ts` |
| `TogetherPeriod`, `TogetherPeriods` | Une période (jour de début, jour de fin ou `null`) et la liste du couple : `create` valide R9, `from` relit sans valider, `empty` pour un nouveau couple | `domain/value-objects/together-period.vo.ts`, `together-periods.vo.ts` |
| `isCalendarDay`, `coupleCalendarDayAt` | Un vrai jour `YYYY-MM-DD` ; le jour de Paris (`COUPLE_TIME_ZONE`) d'un instant | `domain/value-objects/calendar-day.ts` |

Les chemins partent de `packages/couple/server-business-logic/src/pairing/`.

Le code est tiré par `SecureRandomGenerator.generateHex(8)` : chaque octet donne un signe de l'alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` par `octet % 32`, sans biais puisque 256 est un multiple de 32. Il est valable jusqu'à l'instant `émission + durée` exclu.

## Événements

| Événement | `EVENT_NAME` | Données |
|---|---|---|
| `CoupleCreatedEvent` | `pairing.couple.created` | `creatorUserId`, `pairingStatus` |
| `CouplePairedEvent` | `pairing.couple.paired` | `partnerUserIds`, `pairingStatus` |
| `InvitationCodeRenewedEvent` | `pairing.invitation-code.renewed` | aucune (`null`) |
| `CoupleCancelledEvent` | `pairing.couple.cancelled` | aucune (`null`) |
| `TogetherPeriodsRecordedEvent` | `pairing.together-periods.recorded` | `periodCount` |

Chaque événement porte l'`ExecutionContext` complet : `coupleId` du couple, `userId` du partenaire qui agit. Aucun ne porte le code ni un jour d'une période ensemble (règle 33 de `_knowledge/core.md`).

## Invariants

| N° | Invariant | Appliqué par |
|---|---|---|
| INV-001 | Un partenaire n'entre pas deux fois dans le même couple (`PAIRING_PARTNER_ALREADY_IN_COUPLE`) | agrégat (`ensureNotMember`) |
| INV-002 | On ne rejoint qu'un couple `PENDING`, avec son code exact, avant son échéance ; sinon `PAIRING_INVITATION_CODE_INVALID`, sans dire pourquoi (R5, R6) | agrégat (`ensureJoinableWith`) |
| INV-003 | Seul un membre du couple agit sur lui ; un autre reçoit `PAIRING_COUPLE_NOT_FOUND` | agrégat (`ensureMember`) |
| INV-004 | Un couple formé n'a plus de code et refuse d'en recevoir un (`PAIRING_COUPLE_ALREADY_PAIRED`, R7) | agrégat (`join`, `ensurePending`) |
| INV-005 | Un couple `PENDING` a un partenaire et un code ; un couple `PAIRED` en a deux et aucun code | agrégat (seules transitions : `create`, `join`) |
| INV-006 | L'agrégat ne modifie jamais `version` ; il part de 1 et la base l'incrémente | agrégat, repository |
| INV-007 | Un partenaire appartient à un seul couple (R1) | `PairingPreconditionService`, contrainte unique de `CoupleRepository.save` |
| INV-008 | Un code n'existe que dans un couple (`PAIRING_INVITATION_CODE_CONFLICT`) | contrainte unique de `CoupleRepository.save` |
| INV-009 | Seul un membre d'un couple `PENDING` l'annule ; un couple `PAIRED` refuse (`PAIRING_COUPLE_ALREADY_PAIRED`, R8). Un couple annulé ne retient ni son partenaire ni son code | agrégat (`cancel`, `ensureMember`, `ensurePending`), `CoupleRepository.save` |
| INV-010 | Seul un membre d'un couple `PAIRED` enregistre ses périodes ensemble (`PAIRING_COUPLE_NOT_FOUND`, `PAIRING_COUPLE_NOT_PAIRED`) ; la liste compte au moins une période, chacune finit le jour de son début ou après, elles se suivent sans se chevaucher, seule la dernière est ouverte et aucune ne commence après le jour de Paris (`PAIRING_TOGETHER_PERIODS_INVALID`, R9) | agrégat (`recordTogetherPeriods`, `ensurePaired`), `TogetherPeriods.create` |

## Points d'attention

- `fromSnapshot` ne revérifie rien : une donnée incohérente en base (couple `PAIRED` avec un code) est refusée au moment d'agir, par `ensureJoinableWith`.
- Une méthode d'intention commence par ses contrôles et ne modifie l'état qu'ensuite : un refus laisse l'agrégat intact.

## Décisions liées

- [Décision 0028](../../decisions/pairing/0028-regles-du-code-d-invitation.md) : règles du code d'invitation
- [Décision 0038](../../decisions/pairing/0038-annuler-un-couple-en-attente.md) : annuler un couple en attente
- [Décision 0045](../../decisions/pairing/0045-periodes-ensemble-du-couple.md) : les périodes ensemble du couple, en base
- [Décision 0024](../../decisions/0024-determinisme-horloge-et-identifiants.md) : horloge injectée, identifiants UUID v7
