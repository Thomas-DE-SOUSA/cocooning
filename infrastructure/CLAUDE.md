# infrastructure

Images Docker et pile de production de Cocooning (decision plateforme 0015). `docker/nest/Dockerfile` : cibles `runner` (API) et `runner-init` (migrations Prisma). `docker/next/Dockerfile` : la PWA. `compose/docker-compose.prod.yml` : `postgres`, `migrate`, `api`, `web`, `tailscale`, lance sur la VM depuis la racine du depot.

## Consignes de code

- Contexte de build : la racine du depot. `.dockerignore` (racine) est une liste blanche : un dossier nouveau dont le build a besoin y est rouvert.
- `turbo prune <app> --docker` puis `pnpm install --frozen-lockfile --ignore-scripts` : les scripts d'installation restent bloques comme en local (`allowBuilds`).
- `NODE_VERSION` suit `engines.node` du `package.json` racine, `TURBO_VERSION` le catalogue `tooling` : les monter ensemble.
- Une variable ajoutee a l'API ou a la PWA : dans le bloc `environment` de `api` ou de `web` du compose, et dans `compose/.env.example` si c'est un secret (`${VAR:?...}` dans le compose). Meme commit que le `.env.example` et le `env.ts` (API) ou `src/env/server.ts` (PWA) de l'app.
- Images epinglees : `postgres:17-alpine` (meme majeure que `packages/couple/e2e-shared`), `tailscale/tailscale:v<version>`.

## Pieges

- `runner-init` lance `prisma version` au build : c'est lui qui telecharge le moteur de migration, que `allowBuilds` empeche d'installer. Sans `openssl`, ce moteur ne demarre pas.
- Le `web` partage le reseau du conteneur `tailscale` (`network_mode: service:tailscale`) : il n'a pas de `ports`, et `tailscale/serve.json` le joint sur `127.0.0.1:3200`. Il joint l'API par `http://api:3100` (`API_URL`), le nom du service sur le reseau du compose. Un redemarrage de `tailscale` coupe le web jusqu'au sien.
- L'API n'a pas de port publie : seul le compose la joint, sur `http://api:3100`. `tailscale/serve.json` lui envoie le WebSocket des notes (`/collab`, decision 0040), le reste va au web.
- `compose/.env` porte les secrets de production : il reste sur la VM, ignore par git (`.env`).
- `migrate` est un service a usage unique : `restart: 'no'`, et `api` attend `service_completed_successfully`.

## Commandes

- `docker build -f infrastructure/docker/nest/Dockerfile --target runner .` (et `--target runner-init`)
- `docker build -f infrastructure/docker/next/Dockerfile .`
- `docker compose -f infrastructure/compose/docker-compose.prod.yml config --quiet` (verifie le compose ; ajouter `--env-file infrastructure/compose/.env.example` hors de la VM)

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier modifie, trouvee avec `rg -l 'infrastructure/|docker-compose.prod' docs/ _knowledge/ CLAUDE.md`.
- Procedure de mise en production, sauvegarde : `docs/platform/runbooks/deployment/production.md`.
- Cible de deploiement : decision plateforme 0015, remplacee par une nouvelle decision si elle change.
