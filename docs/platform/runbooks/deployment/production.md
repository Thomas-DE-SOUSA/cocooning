---
last-verified: 2026-11-23
---

# Mise en production et mise à jour

Ce runbook installe Cocooning sur la VM Oracle de Cadence, puis le met à jour à chaque merge dans `main`.

Niveau de preuve : exécuté en conditions réelles sur la VM le 2026-11-23 (préparation, démarrage, sauvegarde, installation de la PWA sur un téléphone) ; la mise à jour et la restauration n'ont pas encore servi.

## Quand l'utiliser

- Première installation de Cocooning sur la VM.
- Mise à jour après un merge dans `main`.

## Impact

Pendant une mise à jour, la PWA et l'API redémarrent : quelques secondes d'indisponibilité. Les données restent dans les volumes `postgres-data` et `tailscale-state`. Une PWA restée ouverte pendant la mise à jour se recharge d'elle-même à sa prochaine action (`runServerAction`) ou à son retour au premier plan.

## Diagnostic

1. `docker compose -f infrastructure/compose/docker-compose.prod.yml ps -a` : `postgres` et `api` sont `healthy`, `web` et `tailscale` `Up`, `migrate` `Exited (0)`.
2. `docker compose -f infrastructure/compose/docker-compose.prod.yml logs migrate api web tailscale --tail 50` : la dernière ligne de `migrate` dit « All migrations have been successfully applied » ou « No pending migrations to apply ».

## Résolution

### Préparer la VM (une seule fois)

La VM a déjà Docker et Tailscale pour Cadence ([guide de Cadence](https://github.com/Thomas-DE-SOUSA/cadence/blob/main/docs/deploy/oracle.md)).

1. Créer une clé de déploiement : `ssh-keygen -t ed25519 -f ~/.ssh/cocooning_deploy -N ''`. Coller `~/.ssh/cocooning_deploy.pub` dans GitHub, dépôt `cocooning`, Settings, Deploy keys, sans droit d'écriture.
2. Dans `~/.ssh/config` de la VM :
   ```
   Host github-cocooning
       HostName github.com
       IdentityFile ~/.ssh/cocooning_deploy
   ```
3. Cloner `main` : `git clone -b main git@github-cocooning:Thomas-DE-SOUSA/cocooning.git && cd cocooning`.
4. Dans la console Tailscale : vérifier que MagicDNS et les certificats HTTPS sont activés (Cadence s'en sert déjà), puis Settings, Keys, « Generate auth key » (ni réutilisable, ni éphémère).
5. `cp infrastructure/compose/.env.example infrastructure/compose/.env`, puis remplir : `POSTGRES_PASSWORD` par `openssl rand -hex 24`, `AUTH_JWT_SECRET` par `openssl rand -base64 48`, `TS_AUTHKEY` par la clé de l'étape 4. Ce fichier ne quitte jamais la VM.

### Démarrer ou mettre à jour

1. `cd ~/cocooning && git pull`
2. `docker compose -f infrastructure/compose/docker-compose.prod.yml up -d --build`. Le premier build dure une dizaine de minutes sur la VM ; le certificat HTTPS de Tailscale arrive une minute après le démarrage. Les migrations s'appliquent avant le démarrage de l'API.
3. `docker image prune -f` pour libérer la place des anciennes images.

### Sauvegarder la base

Une sauvegarde par nuit, gardée 14 jours (`crontab -e` sur la VM) :

```
0 3 * * * cd /home/ubuntu/cocooning && docker compose -f infrastructure/compose/docker-compose.prod.yml exec -T postgres pg_dump -U cocooning -Fc cocooning > /home/ubuntu/backups/cocooning-$(date +\%F).dump && find /home/ubuntu/backups -name 'cocooning-*.dump' -mtime +14 -delete
```

Créer le dossier avant : `mkdir -p ~/backups`. Copier ces fichiers hors de la VM reste à organiser.

## Vérification

- Depuis un appareil du tailnet, https://cocooning.<tailnet>.ts.net renvoie vers l'écran « Connexion » (`/sign-in`) ; après la connexion d'un compte créé par le [runbook des comptes](../../../couple/infrastructure/runbooks/authentication/accounts.md), il affiche « Bienvenue sur Cocooning ». Un toast « Connexion impossible » sur un bon mot de passe : lire `docker compose ... logs web --tail 50`. « Invalid Server Actions request » signifie que `tailscale serve` n'a pas transmis le nom public (`X-Forwarded-Host`) : ajouter ce nom à `serverActions.allowedOrigins` de `apps/couple/web/next.config.ts`.
- https://cocooning.<tailnet>.ts.net/manifest.webmanifest et `/sw.js` répondent.
- Sur l'iPhone (Safari, « Partager », « Sur l'écran d'accueil ») et sur l'Android (Chrome, « Installer l'application »), la PWA s'installe et s'ouvre en plein écran.
- `docker compose -f infrastructure/compose/docker-compose.prod.yml exec api node -e "fetch('http://127.0.0.1:3100/health').then((r) => r.text()).then(console.log)"` affiche `{"status":"UP"}`.

## Escalade

- `migrate` sort en erreur : lire ses logs ; l'API ne démarre pas tant qu'il échoue, l'ancienne version reste arrêtée. Corriger la migration dans le dépôt, ou revenir au commit précédent (`git checkout <sha>`) et relancer l'étape 2.
- `web` redémarre en boucle avec « Invalid environment variables » : `API_URL` ou `API_TIMEOUT_MS` manque dans le bloc `environment` de `web` du compose (`apps/couple/web/src/env/server.ts`).
- Le nom `cocooning` n'apparaît pas dans le tailnet : `docker compose ... logs tailscale`. Une clé expirée ou déjà utilisée se remplace dans `.env`, puis `docker compose ... up -d --force-recreate tailscale`.
- Restaurer une sauvegarde : `docker compose ... exec -T postgres pg_restore -U cocooning -d cocooning --clean < ~/backups/cocooning-<date>.dump`, API arrêtée (`docker compose ... stop api web`).
