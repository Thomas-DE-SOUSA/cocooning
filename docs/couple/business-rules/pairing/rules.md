# Règles de la mise en couple

Ce que l'app impose quand deux comptes deviennent un couple. À lire avant de toucher au contexte `pairing` ou à l'écran d'invitation.

## À la création du couple

### R1. Un partenaire appartient à un seul couple

Je ne peux ni créer un deuxième couple ni en rejoindre un autre tant que je suis dans un couple.

- Dans le code : `CreateCoupleUseCase` et `JoinCoupleUseCase` refusent un partenaire déjà présent par `PairingPreconditionService.ensurePartnerHasNoCouple` (`CoupleRepository.findByPartner`) ; `Couple.join` refuse aussi un membre du couple.
- Source : [décision 0022](../../decisions/0022-mise-en-couple-par-code-d-invitation.md) (« un couple compte exactement deux membres ») et [décision 0028](../../decisions/pairing/0028-regles-du-code-d-invitation.md). Validée par : Thomas De Sousa, 2026-11-23.

### R2. Celui qui crée le couple reçoit un code d'invitation

Je crée notre couple, j'en suis le premier membre et l'app me donne un code à transmettre à l'autre. Tant qu'il n'est pas entré, le couple est en attente.

- Dans le code : `CreateCoupleUseCase`, `Couple.create`, statut `PENDING`.
- Source : décision 0022, décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

### R3. Le code fait 8 signes faciles à dicter

Le code n'a ni `I`, ni `O`, ni `0`, ni `1` ; je peux le taper en minuscules ou avec des espaces.

- Dans le code : `InvitationCode.generate` (tirage par `SecureRandomGenerator.generateHex`), `InvitationCode.normalize` (saisie).
- Source : décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

### R4. Le code est valable 48 heures

Passé ce délai, le code ne marche plus et il faut en demander un nouveau.

- Dans le code : `InvitationCode.isValidAt` ; la durée arrive par `invitationCodeLifetimeInHours` dans `CreateCoupleUseCase` et `RenewInvitationCodeUseCase`, lue par l'API dans `PAIRING_INVITATION_CODE_TTL_HOURS`.
- Source : décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

## Quand l'autre rejoint le couple

### R5. Un code valable fait entrer le second partenaire, une seule fois

Mon âme sœur saisit le code : elle devient le second membre, le couple est formé et le code disparaît.

- Dans le code : `JoinCoupleUseCase`, `Couple.join`, statut `PAIRED`, code retiré.
- Source : décision 0022, décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

### R6. Un code faux ne dit pas pourquoi il est faux

Un code inconnu, expiré ou déjà utilisé reçoit la même réponse.

- Dans le code : `PAIRING_INVITATION_CODE_INVALID`, levé par `InvitationCode.normalize`, `PairingPreconditionService.loadCoupleByInvitationCode` et `CouplePairingValidator.ensureJoinableWith`.
- Source : décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

## Tant que le couple est en attente

### R7. Le créateur peut renouveler le code

Je demande un nouveau code : l'ancien ne vaut plus rien et le délai repart de zéro. Un couple formé n'a plus de code.

- Dans le code : `RenewInvitationCodeUseCase`, `Couple.renewInvitationCode`.
- Source : décision 0028. Validée par : Thomas De Sousa, 2026-11-23.

### R8. Le seul membre d'un couple en attente peut l'annuler

J'ai créé un couple par erreur, ou l'autre en a créé un de son côté : j'annule le mien, son code ne vaut plus rien et je peux rejoindre le couple de l'autre. Un couple formé ne s'annule pas.

- Dans le code : `CancelCoupleUseCase`, `Couple.cancel` (suppression douce, lignes `couple_partner` effacées).
- Source : [décision 0038](../../decisions/pairing/0038-annuler-un-couple-en-attente.md). Validée par : Thomas De Sousa, 2026-11-23.

## Quand le couple est formé

### R9. Le couple enregistre ses périodes ensemble

Nous disons depuis quand nous sommes ensemble, et les moments où nous ne l'étions pas : l'app garde la liste de nos périodes ensemble. Une nouvelle liste remplace la précédente. Elle compte au moins une période ; chacune finit le jour de son début ou après ; les périodes se suivent dans l'ordre sans se chevaucher ; seule la dernière peut être ouverte (elle dure encore) ; aucune ne commence après aujourd'hui (jour de Paris). Seul un couple formé enregistre ses périodes.

- Dans le code : `RecordTogetherPeriodsUseCase`, `Couple.recordTogetherPeriods`, `TogetherPeriods.create` et `TogetherPeriod.create` (`PAIRING_TOGETHER_PERIODS_INVALID`), `CouplePairingValidator.ensurePaired` (`PAIRING_COUPLE_NOT_PAIRED`). Lancé par la commande `record-together-periods` de l'API ([runbook](../../infrastructure/runbooks/pairing/together-periods.md)).
- Source : message du propriétaire du 2026-11-24 (une date de début, une séparation, une reprise ; les dates restent en base, jamais dans le dépôt) et sa réponse « Sur le couple, en base (Recommandé) » ; [décision 0045](../../decisions/pairing/0045-periodes-ensemble-du-couple.md). Validée par : Thomas De Sousa, 2026-11-24.

## Cas et exceptions

| Situation | Ce qui s'applique |
|---|---|
| Créer un couple quand on en a déjà un | Refusée, `409` `PAIRING_PARTNER_ALREADY_IN_COUPLE` (R1) |
| Saisir un code quand on est déjà dans un couple, y compris le sien | Refusée, `409` `PAIRING_PARTNER_ALREADY_IN_COUPLE` (R1) |
| Code inconnu, expiré ou déjà utilisé | Refusée, `422` `PAIRING_INVITATION_CODE_INVALID` (R6) |
| Renouveler le code d'un couple formé | Refusée, `409` `PAIRING_COUPLE_ALREADY_PAIRED` (R7) |
| Annuler un couple formé | Refusée, `409` `PAIRING_COUPLE_ALREADY_PAIRED` (R8) |
| Annuler sans avoir de couple | Refusée, `404` `PAIRING_COUPLE_NOT_FOUND` (R8) |
| Demander son couple sans en avoir | Refusée, `404` `PAIRING_COUPLE_NOT_FOUND` : l'app montre l'écran d'invitation |
| Enregistrer les périodes d'un couple en attente | Refusée, `409` `PAIRING_COUPLE_NOT_PAIRED` (R9) |
| Enregistrer une liste vide, une période qui finit avant son début, des périodes dans le désordre ou qui se chevauchent, une période ouverte avant la dernière, une période qui commence après aujourd'hui, un jour mal écrit | Refusée, `422` `PAIRING_TOGETHER_PERIODS_INVALID` (R9) |
| Enregistrer les périodes sans avoir de couple | Refusée, `404` `PAIRING_COUPLE_NOT_FOUND` (R9) |
| Quitter un couple formé | Pas encore possible, à décider avec le propriétaire |

## Voir aussi

- [Glossaire de pairing](glossary.md)
- [Décision 0029](../../decisions/pairing/0029-pairing-avant-le-couple.md) : pourquoi ces use cases tournent sans `coupleId`
