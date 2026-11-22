# Glossaire de pairing

Les termes propres à la mise en couple, avec leur nom dans le code. Les termes communs (couple, partenaire) sont dans le [glossaire transverse](../../../architecture/glossary.md).

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Mise en couple** | contexte `pairing` | Le parcours qui relie deux comptes en un couple |
| **Créer le couple** | `CreateCoupleUseCase`, `Couple.create` | Le premier partenaire ouvre le couple et reçoit un code |
| **Rejoindre le couple** | `JoinCoupleUseCase`, `Couple.join` | Le second partenaire saisit le code et entre dans le couple |
| **Code d'invitation** | `InvitationCode` | 8 signes, valable 48 heures, utilisable une fois |
| **Renouveler le code** | `RenewInvitationCodeUseCase`, `Couple.renewInvitationCode` | Remplacer le code d'un couple en attente |
| **Membre du couple** | `CouplePartner` | Un partenaire inscrit dans le couple, avec sa date d'arrivée |
| **Couple en attente** | `CouplePairingStatus` `PENDING` | Un seul membre, un code valable |
| **Couple formé** | `CouplePairingStatus` `PAIRED` | Les deux partenaires sont membres, plus de code |
