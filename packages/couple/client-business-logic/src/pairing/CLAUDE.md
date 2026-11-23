# Pairing

La mise en couple depuis la PWA : lire le couple du partenaire connecte, creer le couple, saisir le code d'invitation, renouveler le code.

## A lire avant de commencer

Glossaire :
@../../../../../docs/couple/business-rules/pairing/glossary.md

Regles metier :
@../../../../../docs/couple/business-rules/pairing/rules.md

Architecture front :
@../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- `PairingGateway` agit toujours pour le partenaire connecte : son adaptateur renvoie la session a l'API (decision 0036). Aucune methode ne prend de `coupleId` ni de `userId` : l'API les tire de la session.
- `GetMyCoupleUseCase` change le refus `PAIRING_COUPLE_NOT_FOUND` en `ok(null)` : pas de couple est un etat normal, l'ecran d'invitation s'affiche. Tout autre refus remonte tel quel (`UNAUTHORIZED` compris, la page renvoie vers la connexion).
- `createJoinCoupleFormSchema(t)` ne garde que la borne brute `INVITATION_CODE_ENTRY_MAX_LENGTH` (`@cocooning/couple-shared-kernel/limits`) : ni majuscules ni longueur exacte, le domaine normalise (R3) et seul l'API dit qu'un code est faux (R6). Cles `form.invitationCode.errors.{required,tooLong}` (decision 0031).

## Tests

- `FakePairingGateway` (sous-chemin `@cocooning/couple-client-business-logic/testing`) : journal `calls`, `givenCouple(couple)`, `givenRefusal(error)` (vaut pour tous les appels), couples `A_PENDING_COUPLE` (par defaut) et `A_PAIRED_COUPLE`.
