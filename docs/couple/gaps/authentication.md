# Écarts : authentication

Écarts constatés dans le contexte `authentication`. On ajoute en fin de fichier ; une entrée traitée garde sa trace avec son nouveau statut.

### 001. L'agrégat `Account` n'enregistre aucun événement de domaine

- Type : écart avec une règle validée
- Constaté le : 2026-11-23, création du contexte (branche `feat/authentication-domain`)
- Où : `packages/couple/server-business-logic/src/authentication/domain/models/account.aggregate.ts`
- Constat : `Account.create` et `Account.revokeSessions` changent l'état sans enregistrer d'événement, et le contexte n'a pas d'outbox. Aucun contexte ne réagit encore à un compte ou à une déconnexion ; un événement et sa table n'auraient aucun lecteur.
- Règle concernée : `_knowledge/backend/domain.md` règle 3
- Statut : ouvert

### 002. Aucune limite d'essais de connexion

- Type : décision à trancher
- Constaté le : 2026-11-23, création du contexte (branche `feat/authentication-domain`)
- Où : `packages/couple/server-business-logic/src/authentication/domain/services/authentication-precondition.service.ts` (`loadAccountByCredentials`)
- Constat : un appareil du tailnet peut tenter autant de mots de passe qu'il veut. Argon2id ralentit chaque essai et le mot de passe fait au moins 12 caractères ; aucun compte n'est verrouillé.
- Règle concernée : [décision 0032](../decisions/authentication/0032-regles-du-compte-et-de-la-session.md)
- Statut : ouvert

### 003. Le mot de passe ne se change ni ne se réinitialise

- Type : règle validée non construite
- Constaté le : 2026-11-23, création du contexte (branche `feat/authentication-domain`)
- Où : `packages/couple/server-business-logic/src/authentication/application/use-cases/`
- Constat : aucun use case ne change le hachage d'un compte. Un mot de passe oublié oblige le propriétaire à recréer le compte, ce qui change son `userId`.
- Règle concernée : [décision 0019](../decisions/0019-authentification-locale.md) (contexte complet au plus tard en phase 7)
- Statut : ouvert
