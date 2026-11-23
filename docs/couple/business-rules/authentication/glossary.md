# Glossaire d'authentication

Les termes propres aux comptes et à la session, avec leur nom dans le code. Les termes communs (compte, session, connexion) sont dans le [glossaire transverse](../../../architecture/glossary.md).

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Créer un compte** | `CreateAccountUseCase`, `Account.create` | Ouvrir le compte d'un partenaire avec son adresse et son mot de passe ; jamais depuis l'application |
| **Se connecter** | `SignInUseCase`, `Account.openSession` | Échanger son adresse et son mot de passe contre une session de 90 jours |
| **Se déconnecter** | `SignOutUseCase`, `Account.revokeSessions` | Fermer toutes ses sessions, sur tous ses appareils |
| **Résoudre une session** | `ResolveSessionUseCase` | Retrouver le partenaire d'une requête à partir de son jeton |
| **Mot de passe haché** | `passwordHash`, port `PasswordHasher` | Le mot de passe transformé par Argon2id ; le mot de passe lui-même n'est jamais gardé |
| **Jeton de session** | `sessionToken`, port `SessionTokenSigner` | Le jeton signé qui porte le partenaire, la version de session et l'échéance |
| **Contenu du jeton** | `SessionClaims` | `userId`, `sessionVersion`, `expiresAt` |
| **Version de session** | `sessionVersion` | Le numéro que porte chaque jeton ; il augmente à chaque déconnexion, ce qui invalide les jetons plus anciens |
