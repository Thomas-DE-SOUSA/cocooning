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
- Constat : un appareil du tailnet peut tenter autant de mots de passe qu'il veut. Argon2id ralentit chaque essai et le mot de passe fait au moins 12 caractères ; aucun compte n'est verrouillé. Des essais en rafale occupent aussi les 4 fils du pool libuv qui calculent Argon2 (64 Mio chacun) et ralentissent les autres requêtes de l'API sans la faire tomber. Un refus n'est journalisé qu'avec son code (`HttpExceptionFilter`) : rien ne dit quel appareil essayait (voir 005).
- Règle concernée : [décision 0032](../decisions/authentication/0032-regles-du-compte-et-de-la-session.md)
- Statut : clos, tranché par la [décision 0043](../decisions/authentication/0043-le-tailnet-borne-les-essais-de-connexion.md) : aucune limite, le tailnet borne les essais

### 003. Le mot de passe ne se change ni ne se réinitialise

- Type : règle validée non construite
- Constaté le : 2026-11-23, création du contexte (branche `feat/authentication-domain`)
- Où : `packages/couple/server-business-logic/src/authentication/application/use-cases/`
- Constat : aucun use case ne change le hachage d'un compte. Un mot de passe oublié oblige le propriétaire à recréer le compte, ce qui change son `userId`.
- Règle concernée : [décision 0019](../decisions/0019-authentification-locale.md) (contexte complet au plus tard en phase 7)
- Statut : ouvert

### 004. La PWA garde un cookie dont la session n'est plus valable

- Type : règle validée non construite
- Constaté le : 2026-11-23, écran de connexion (branche `feat/authentication-web`)
- Où : `apps/couple/web/src/proxy.ts`
- Constat : le proxy laisse passer toute requête qui porte le cookie `cocooning_session`, sans savoir si l'API l'accepte encore. Une session fermée par `SignOutUseCase` sur un autre appareil, ou un jeton refusé par le garde de l'API, ne renvoie pas vers l'écran de connexion : aucune page ne lit encore l'API, et la PWA n'a ni écran de déconnexion ni retrait du cookie sur un `401`. Les données restent protégées : le garde de session de l'API refuse le jeton à chaque appel.
- Règle concernée : [décision 0034](../decisions/0034-session-revocable.md)
- Statut : corrigé le 2026-11-23 (branche `feat/sign-out`) : une page qui lit l'API renvoie vers la connexion sur `UNAUTHORIZED` (décision 0036), et « Se déconnecter » ferme les sessions de tous les appareils puis retire le cookie de ce navigateur. Sur un autre appareil, le cookie refusé reste jusqu'à la connexion suivante, sans rien ouvrir.

### 005. L'adresse IP et le User-Agent transmis à la connexion n'ont aucun lecteur dans l'API

- Type : règle validée non construite
- Constaté le : 2026-11-23, revue des étapes 2 et 3
- Où : `apps/couple/web/src/modules/authentication/services/sign-in-client-context.service.ts`, `packages/couple/client-infrastructure/src/shared/authentication/gateways/api-authentication.gateway.ts` (`clientHeaders`), `apps/couple/api/src/main.ts`
- Constat : la PWA envoie `x-forwarded-for` (le premier élément de l'en-tête reçu) et `user-agent` à `POST /authentication/session`, comme le demande la règle 13 de `core-frontend.md`. L'API ne pose pas `trust proxy` et aucun code ne lit ces en-têtes, ni un use case, ni un log : la transmission n'a aucun effet. Le jour où l'API s'en servira (limite d'essais, 002), il faudra vérifier sur la VM ce que `tailscale serve` met dans `x-forwarded-for`, le premier élément étant celui qu'un client peut forger.
- Règle concernée : `core-frontend.md` règle 13
- Statut : corrigé le 2026-11-23 (branche `fix/sign-in-client-context`) : la PWA ne transmet plus ni l'adresse IP ni le User-Agent ([décision 0043](../decisions/authentication/0043-le-tailnet-borne-les-essais-de-connexion.md)), et la règle 13 de `core-frontend.md` le dit
