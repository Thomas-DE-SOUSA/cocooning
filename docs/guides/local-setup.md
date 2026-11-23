# Installer le dépôt en local

Ce guide installe le monorepo sur un poste de développement, vérifie que les contrôles passent et démarre l'API du couple. À suivre à la première installation ou après un changement de version de Node ou de pnpm.

Le dépôt contient l'outillage, les packages, l'API NestJS (`apps/couple/api`) et le socle de la PWA Next.js (`apps/couple/web`).

## Avant de commencer

- Node.js 22 ou plus récent (`engines.node` du `package.json` racine).
- pnpm à la version fixée par `packageManager` dans le `package.json` racine ; Corepack l'active avec `corepack enable`.
- Docker, pour la base PostgreSQL locale et les tests d'intégration et E2E.
- Un accès au dépôt privé `git@github.com:Thomas-DE-SOUSA/cocooning.git`.

## Étapes

1. Cloner le dépôt et se placer sur `dev` : `git clone git@github.com:Thomas-DE-SOUSA/cocooning.git && cd cocooning && git switch dev`. Résultat attendu : la branche `dev` est active.
2. Installer les dépendances : `pnpm install`. Résultat attendu : l'installation se termine sans erreur et le script `prepare` installe les hooks Husky (`.husky/`).
3. Lancer les contrôles : `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build`. Résultat attendu : les quatre commandes se terminent sans erreur.

## Démarrer l'API

1. Démarrer PostgreSQL 17 avec les identifiants des fichiers `.env.example` : `docker run -d --name cocooning-postgres -e POSTGRES_USER=cocooning -e POSTGRES_PASSWORD=cocooning -e POSTGRES_DB=cocooning -p 127.0.0.1:5432:5432 postgres:17-alpine`. Si le port 5432 est déjà pris, en choisir un autre et le reporter dans les deux `.env` ci-dessous.
2. Créer les deux fichiers d'environnement à partir des exemples : `cp packages/couple/prisma/.env.example packages/couple/prisma/.env` et `cp apps/couple/api/.env.example apps/couple/api/.env`. Dans `apps/couple/api/.env`, remplacer `AUTH_JWT_SECRET` par la sortie de `openssl rand -base64 48`. Les `.env` ne sont jamais versionnés.
3. Appliquer les migrations : `pnpm --filter @cocooning/couple-prisma db:deploy`.
4. Lancer l'API : `pnpm --filter couple-api... build`, puis `pnpm --filter couple-api dev`. Le script reconstruit et relance l'API à chaque changement de `apps/couple/api/src`. `pnpm dev:couple`, depuis la racine, construit d'abord les packages puis les recompile en continu ; l'API relit leur `dist/` à son prochain redémarrage.

Les variables de l'API, leur rôle et leur valeur de développement sont commentés dans `apps/couple/api/.env.example`. `PAIRING_INVITATION_CODE_TTL_HOURS` fixe la durée de validité d'un code d'invitation, en heures entières (`48` en développement, [décision 0028](../couple/decisions/pairing/0028-regles-du-code-d-invitation.md)), et `AUTH_SESSION_TTL_DAYS` celle d'une session, en jours entiers (`90`, [décision 0034](../couple/decisions/0034-session-revocable.md)) : un `.env` créé avant leur arrivée doit les recevoir, sinon l'API refuse de démarrer. Au démarrage, l'API valide son environnement (`apps/couple/api/src/env.ts`) et s'arrête si une variable manque ou sort de ses bornes.

## Démarrer la PWA

Lancer `pnpm --filter couple-web... build` une première fois (il construit les packages dont l'app dépend), puis `pnpm --filter couple-web dev`. La PWA répond sur http://localhost:3200 (l'API garde le port 3100) et ouvre l'écran de connexion. Elle lit deux variables, commentées dans `apps/couple/web/.env.example` : `API_URL` (l'API locale, `http://localhost:3100`) et `API_TIMEOUT_MS` (`5000`). Copier ce fichier en `apps/couple/web/.env` ; sans elles, le serveur de la PWA refuse de démarrer (`apps/couple/web/src/env/server.ts`). Pour se connecter, créer un compte local avec la commande `create-account` ([runbook des comptes](../couple/infrastructure/runbooks/authentication/accounts.md)), l'API démarrée.

`next dev` tourne en Turbopack, sans service worker. Le service worker n'existe qu'après le build de production, construit en webpack ([décision plateforme 0014](../platform/decisions/0014-socle-technique-de-la-pwa.md)) : `pnpm --filter couple-web build`, puis `pnpm --filter couple-web start` (port 3200).

## Essayer la PWA sur le téléphone

Un service worker ne s'enregistre qu'en HTTPS, sauf sur `localhost`. Pour installer la PWA sur l'iPhone ou l'Android, la servir par Tailscale, comme en production ([décision plateforme 0006](../platform/decisions/0006-deploiement-vm-docker-compose-tailscale.md)) :

1. Construire et lancer la PWA : `pnpm --filter couple-web build && pnpm --filter couple-web start`.
2. Dans un autre terminal : `tailscale serve --bg 3200`. Tailscale publie le port 3200 en HTTPS, avec un certificat valide, sur `https://<machine>.<tailnet>.ts.net`, visible des seuls appareils du tailnet. HTTPS doit être activé dans la console d'administration de Tailscale.
3. Sur le téléphone, connecté au tailnet, ouvrir cette adresse. Sur iPhone, Safari, « Partager », puis « Sur l'écran d'accueil ». Sur Android, Chrome propose « Installer l'application ».
4. Arrêter le partage : `tailscale serve --https=443 off`.

`pnpm --filter couple-web dev --experimental-https` sert le dev en HTTPS avec un certificat local (mkcert), utile pour essayer une API du navigateur réservée à HTTPS depuis le poste. Le téléphone ne fait pas confiance à ce certificat sans y installer l'autorité de mkcert, et le dev n'a pas de service worker : pour l'installation, passer par Tailscale.

## Vérifier le résultat

- `git config core.hooksPath` affiche le dossier des hooks Husky, et un commit sur une branche mal nommée est refusé par `validate-branch-name`.
- `curl -i http://localhost:3100/health` répond `200` et `{"status":"UP"}` (port `PORT` du `.env`). Une route non publique répond `401` sans cookie de session valide ([décision 0034](../couple/decisions/0034-session-revocable.md)). `POST /authentication/session` avec `{"emailAddress": "...", "password": "..."}` répond le jeton (`sessionToken`) d'un compte existant ; l'envoyer dans le cookie `cocooning_session` ouvre les routes de `pairing` (`POST /pairing/couple`, `GET /pairing/couple`), et `DELETE /authentication/session` ferme toutes les sessions du partenaire.
- http://localhost:3200 renvoie vers l'écran « Connexion » (`/sign-in`) sans cookie de session ; après la connexion, « Notre couple » tant que le couple n'est pas formé, puis « Bienvenue sur Cocooning ». Une adresse inconnue affiche la page « Page introuvable ».
- Après `build` et `start` de la PWA, `curl -I http://localhost:3200/manifest.webmanifest` et `curl -I http://localhost:3200/sw.js` répondent `200`, et http://localhost:3200/~offline affiche « Hors ligne ». Dans les outils du navigateur, onglet « Application », le service worker est actif ; en coupant le réseau, une page non visitée affiche « Hors ligne ».
- `pnpm --filter couple-api test:e2e` démarre son propre PostgreSQL dans Docker et passe sans `.env`.

## En cas de problème

| Symptôme | Cause | Correction |
|---|---|---|
| pnpm refuse de s'exécuter ou installe une autre version | Corepack inactif | `corepack enable`, puis relancer `pnpm install` |
| Un paquet récent est refusé à l'installation | `minimumReleaseAge` de `pnpm-workspace.yaml` exige un jour d'ancienneté | Attendre, ou choisir la version précédente |
| L'API s'arrête au démarrage sur une erreur Zod | Variable absente ou invalide dans `apps/couple/api/.env` | Comparer avec `.env.example` ; `AUTH_JWT_SECRET` fait au moins 32 caractères et ne commence pas par `change-me` (la valeur d'exemple du compose de production) |
| `EADDRINUSE` au démarrage de l'API | Le port `PORT` est déjà pris | Changer `PORT` dans `apps/couple/api/.env` |
| `Cannot find module '.../dist/...'` | Un package n'est pas construit | `pnpm --filter couple-api... build` |
| Le serveur de la PWA s'arrête sur « Invalid environment variables » | `apps/couple/web/.env` manque ou n'a pas `API_URL`, `API_TIMEOUT_MS` | Le copier depuis `apps/couple/web/.env.example` |
| Toast « Connexion impossible » : « Cocooning ne répond pas » | L'API ne tourne pas, ou `API_URL` pointe ailleurs | Démarrer l'API, vérifier `API_URL` |
| `/sw.js` répond `404` | La PWA tourne en `dev`, ou le build est antérieur | `pnpm --filter couple-web build`, puis `start` |
| Le téléphone ne propose pas l'installation | Page servie en HTTP, ou téléphone hors du tailnet | Passer par `tailscale serve` et vérifier la connexion Tailscale du téléphone |

## Voir aussi

- [Contribuer](contributing.md)
