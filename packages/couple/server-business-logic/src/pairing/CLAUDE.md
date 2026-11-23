# Pairing

La mise en couple : un partenaire cree le couple et recoit un code d'invitation, l'autre saisit le code et le rejoint.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/pairing/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/pairing/rules.md

Architecture :
@../../../../../docs/couple/architecture/pairing/aggregate.md

## Consignes de code

- Les use cases recoivent `PartnerContext` (`{ userId }`), les evenements portent l'`ExecutionContext` complet (decision 0029).
- Le code d'invitation est un secret : jamais dans un evenement ni dans un log.
- Un refus sur le code repond toujours `PAIRING_INVITATION_CODE_INVALID`, quelle que soit la cause (R6).

## Tests

- `givenPendingCoupleOf(userId)` et `givenPairedCoupleOf(creator, joiner)` (`__tests__/fixtures/pairing-test.context.ts`) posent un couple sans evenement : les assertions ne voient que ceux du use case.
- Le premier code tire par `FakeSecureRandomGenerator` est `AAAAAAAB`, le suivant `AAAAAAAC`.
- `simulateConcurrentSave(couple)` du repository en memoire ecrit un autre couple juste avant le prochain `save()` : conflit de version ou index unique.
