---
last-verified: 2026-11-23
---

# Mise en production et mise à jour

Ce runbook installe Cocooning sur la VM Oracle de Cadence, puis le met à jour à chaque merge dans `main`.

Niveau de preuve : exécuté en conditions réelles sur la VM le 2026-11-23 (préparation, démarrage, sauvegarde, installation de la PWA sur un téléphone) ; mise à jour exécutée le 2026-11-23 (releases #39, #50, #54, #57) ; la restauration n'a pas encore servi.

## Quand l'utiliser

- Première installation de Cocooning sur la VM.
- Mise à jour après un merge dans `main`.

## Impact

Pendant une mise à jour, la PWA et l'API redémarrent : quelques secondes d'indisponibilité. SearXNG ne garde rien. Les données restent dans les volumes `postgres-data`, `files` (les photos instantanées, `FILE_STORAGE_DIRECTORY` de l'`api`, [décision 0027](../../../couple/decisions/0027-stockage-des-photos.md)) et `tailscale-state`. Une PWA restée ouverte pendant la mise à jour se recharge d'elle-même à sa prochaine action (`runServerAction`) ou à son retour au premier plan.

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
5. `cp infrastructure/compose/.env.example infrastructure/compose/.env`, puis remplir : `POSTGRES_PASSWORD` par `openssl rand -hex 24`, `AUTH_JWT_SECRET` par `openssl rand -base64 48` (l'API refuse de démarrer sur la valeur d'exemple `change-me…`), `TS_AUTHKEY` par la clé de l'étape 4, `NOTES_COLLABORATION_URL` par `wss://cocooning.<tailnet>.ts.net/collab` (l'adresse de la PWA), `WEB_PUSH_VAPID_PUBLIC_KEY` et `WEB_PUSH_VAPID_PRIVATE_KEY` par la paire de `npx web-push generate-vapid-keys` (lancée sur un poste, une seule fois : une nouvelle paire rend muets tous les téléphones abonnés, qui doivent se réabonner), `WEB_PUSH_VAPID_SUBJECT` par `https://cocooning.<tailnet>.ts.net`, `SEARXNG_SECRET` par `openssl rand -hex 32`, `NOTE_CARD_GEMINI_API_KEY` par la clé Gemini créée par le propriétaire sur https://aistudio.google.com/apikey avec le compte Google de Cocooning ([décision 0054](../../../couple/decisions/notes/0054-recherche-des-fiches-searxng-et-gemini.md) ; une clé collée ailleurs se change). L'API refuse de démarrer sur les valeurs d'exemple. Ce fichier ne quitte jamais la VM.

### Démarrer ou mettre à jour

1. `cd ~/cocooning && git pull`, puis comparer `infrastructure/compose/.env` à `.env.example` : une variable ajoutée par la release s'y ajoute avant le build (dernière en date : `SEARXNG_SECRET` et `NOTE_CARD_GEMINI_API_KEY`, dossiers IA ; sans elles, `docker compose` refuse de démarrer).
2. `docker compose -f infrastructure/compose/docker-compose.prod.yml up -d --build`. Le premier build dure une dizaine de minutes sur la VM ; le certificat HTTPS de Tailscale arrive une minute après le démarrage. Les migrations s'appliquent avant le démarrage de l'API.
3. `docker image prune -f` pour libérer la place des anciennes images.

### Sauvegarder la base

Une sauvegarde par nuit, gardée 14 jours (`crontab -e` sur la VM) :

```
0 3 * * * cd /home/ubuntu/cocooning && docker compose -f infrastructure/compose/docker-compose.prod.yml exec -T postgres pg_dump -U cocooning -Fc cocooning > /home/ubuntu/backups/cocooning-$(date +\%F).dump && find /home/ubuntu/backups -name 'cocooning-*.dump' -mtime +14 -delete
```

Créer le dossier avant : `mkdir -p ~/backups`. Copier ces fichiers hors de la VM reste à organiser. Cette sauvegarde ne couvre que la base : les photos du volume `files` n'en font pas partie, leur sauvegarde reste à organiser elle aussi.

## Vérification

- Depuis un appareil du tailnet, https://cocooning.<tailnet>.ts.net renvoie vers l'écran « Connexion » (`/sign-in`) ; après la connexion d'un compte créé par le [runbook des comptes](../../../couple/infrastructure/runbooks/authentication/accounts.md), il affiche « Notre couple » (`/pairing`) tant que le couple n'est pas formé, puis « Nos notes ». Un toast « Connexion impossible » sur un bon mot de passe : lire `docker compose ... logs web --tail 50`. « Invalid Server Actions request » signifierait que `tailscale serve` n'a pas transmis le nom public (`X-Forwarded-Host`) : vérifié absent le 2026-11-23 ; s'il apparaît, ajouter ce nom à `serverActions.allowedOrigins` de `apps/couple/web/next.config.ts`.
- https://cocooning.<tailnet>.ts.net/manifest.webmanifest et `/sw.js` répondent.
- Édition à deux : ouvrir la même note sur les deux téléphones ; une frappe sur l'un apparaît sur l'autre en une seconde. Le WebSocket `wss://cocooning.<tailnet>.ts.net/collab` passe par `tailscale serve` jusqu'à l'API (`infrastructure/compose/tailscale/serve.json`, décision 0040). Depuis un appareil du tailnet, `timeout 8 curl --http1.1 -sv -o /dev/null -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' https://cocooning.<tailnet>.ts.net/collab 2>&1 | grep '^< HTTP'` affiche `< HTTP/1.1 101 Switching Protocols`. Sans `--http1.1`, curl choisit HTTP/2, qui n'a pas de mise à niveau WebSocket : l'API voit un simple GET et répond `404`. Avec `-si | head -1`, la connexion reste ouverte et la ligne arrive vide.
- Sur l'iPhone (Safari, « Partager », « Sur l'écran d'accueil ») et sur l'Android (Chrome, « Installer l'application »), la PWA s'installe et s'ouvre en plein écran.
- Invitation photo du jour : `PHOTO_PROMPT_SCHEDULER_ENABLED` vaut `true` dans le bloc `environment` de l'`api` du compose (aucune valeur à mettre dans `.env`). Après 9 h, heure de Paris, `docker compose ... exec postgres psql -U cocooning -d cocooning -c "SELECT day, issued_at IS NOT NULL AS issued FROM photo_prompt ORDER BY day DESC LIMIT 2"` montre l'invitation du jour (l'heure tirée reste dans `scheduled_at`, à ne pas divulguer au couple).
- Notifications : `OUTBOX_RELAY_ENABLED` vaut `true` dans le bloc `environment` de l'`api` du compose. Le premier déploiement du relais (migration `20261124234500_messaging_push_subscription`) marque publiés les événements déjà écrits : aucune notification ne part pour le passé. Ensuite, `docker compose ... exec postgres psql -U cocooning -d cocooning -c "SELECT count(*) FROM note_event WHERE NOT published UNION ALL SELECT count(*) FROM agenda_event WHERE NOT published UNION ALL SELECT count(*) FROM messaging_event WHERE NOT published"` revient à zéro en quelques secondes, et `SELECT owner_id, created_at FROM push_subscription` montre un abonnement par téléphone (jamais l'`endpoint`, secret du téléphone).
- Dossiers IA : SearXNG (`searxng`) est `Up`, sans port publié. Depuis l'API, `docker compose -f infrastructure/compose/docker-compose.prod.yml exec api node -e "fetch('http://searxng:8080/search?q=test&format=json&language=fr').then((r) => r.json()).then((d) => console.log(d.results.length, JSON.stringify(d.unresponsive_engines)))"` affiche un nombre de résultats non nul et les moteurs qui ont refusé (un moteur bloqué est sauté, il en faut au moins un qui réponde). La tâche de fond tourne si `NOTE_CARD_ENRICHMENT_ENABLED` vaut `true` dans le bloc `environment` de l'`api` ; après l'ajout d'un élément dans un dossier IA, `docker compose ... exec postgres psql -U cocooning -d cocooning -c "SELECT status, count(*) FROM note_card GROUP BY status"` montre la fiche passer de `PENDING` à `FILLED`, `CHOOSING` ou `FAILED` en moins d'une minute, et `SELECT count(*) FROM note_card_search WHERE searched_at > now() - interval '1 day'` les recherches du jour (jamais le contenu des fiches, qui appartient au couple).
- `docker compose -f infrastructure/compose/docker-compose.prod.yml exec api node -e "fetch('http://127.0.0.1:3100/health').then((r) => r.text()).then(console.log)"` affiche `{"status":"UP"}`.

## Escalade

- `migrate` sort en erreur : lire ses logs ; l'API ne démarre pas tant qu'il échoue, l'ancienne version reste arrêtée. Corriger la migration dans le dépôt, ou revenir au commit précédent (`git checkout <sha>`) et relancer l'étape 2.
- `web` redémarre en boucle avec « Invalid environment variables » : `API_URL`, `API_TIMEOUT_MS` ou `NOTES_COLLABORATION_URL` manque dans le bloc `environment` de `web` du compose, ou `NOTES_COLLABORATION_URL` dans `infrastructure/compose/.env` (`apps/couple/web/src/env/server.ts`).
- Aucune invitation photo n'est tirée : lire `docker compose ... logs api | grep 'Photo prompt tick failed'` (un passage échoué est repris la minute suivante) et vérifier `PHOTO_PROMPT_SCHEDULER_ENABLED` dans le compose.
- Aucune notification n'arrive : lire `docker compose ... logs api | grep -E 'Outbox relay tick failed|Push notification not delivered'`. Un passage échoué est repris cinq secondes après ; un refus porte le `statusCode` du service de notification (`404` et `410` oublient l'abonnement, le téléphone doit se réabonner ; `403` signale une paire VAPID changée ou un `WEB_PUSH_VAPID_SUBJECT` refusé). Vérifier `OUTBOX_RELAY_ENABLED` dans le compose et les trois `WEB_PUSH_VAPID_*` dans `.env`.
- Les fiches restent `FAILED` : lire `docker compose ... logs api | grep -E 'Gemini (request refused|request failed|answer refused|API key missing)|SearXNG (request refused|request failed|answer refused)|Note card enrichment tick failed'`. Le journal ne porte que l'opération et le statut (`429` : quota gratuit de Gemini épuisé, réessayer plus tard ; `400` ou `403` : clé ou modèle refusés, vérifier `NOTE_CARD_GEMINI_API_KEY` dans `.env` et `NOTE_CARD_GEMINI_MODEL` dans le compose). Un SearXNG sans résultat : `docker compose ... logs searxng --tail 50` dit quels moteurs bloquent (`CAPTCHA`, `access denied`) ; les moteurs se règlent dans `infrastructure/compose/searxng/settings.yml`, puis `docker compose ... up -d --force-recreate searxng`. Toutes les fiches `LIMIT_REACHED` : le plafond du jour de Paris (`NOTE_CARD_DAILY_SEARCH_LIMIT`, R23) est atteint, « Mettre à jour » réessaie le lendemain.
- Le nom `cocooning` n'apparaît pas dans le tailnet : `docker compose ... logs tailscale`. Une clé expirée ou déjà utilisée se remplace dans `.env`, puis `docker compose ... up -d --force-recreate tailscale`.
- Restaurer une sauvegarde : `docker compose ... exec -T postgres pg_restore -U cocooning -d cocooning --clean < ~/backups/cocooning-<date>.dump`, API arrêtée (`docker compose ... stop api web`).
- L'éditeur des notes reste vide et le `curl` de `/collab` ne répond pas `101` : `tailscale` n'a pas relu `serve.json`, ou ne joint pas l'API. `docker compose ... restart tailscale web` (le `web` partage le réseau de `tailscale`, il redémarre avec lui).
