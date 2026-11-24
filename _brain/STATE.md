# État du projet

> Mis à jour : 2026-11-24 nuit (PR #13, fil des messages, mergée ; PR B, photo du jour, en cours par un sous-agent sur `feat/messaging-photo-prompt`, non commitée). Dernière consolidation : aucune.
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **En production** (VM, release PR #9 du dépôt public, 2026-11-24 nuit) : notes à deux en direct, direction artistique A « Lin et terre cuite » (décision plateforme 0017), barre d'onglets Notes, Agenda, Nous (décision 0044), compteur « Ensemble dans notre cocooning depuis N jours » dans « Nous » (décision 0045, périodes saisies par `record-together-periods`), agenda partagé complet (décisions 0046 à 0049 : grille du mois, liste du jour, panneau de création, « Rien que pour moi », « Aujourd'hui » qui change le jour sans faire défiler, suppression par glissement vers la gauche).
- **Dépôt public depuis le 2026-11-24** (décision plateforme 0018) : https://github.com/Thomas-DE-SOUSA/cocooning, historique réécrit (e-mail d'un compte, nom de l'éditeur de Malta, chemins, tailnet retirés ; scripts Malta hors git). L'ancien dépôt, avec les PR #1 à #103, est `cocooning-archive` (privé, ne jamais le rendre public). Les numéros de PR repartent de 1.
- **Chemins locaux, tailnet, URL de production réelle** : `CLAUDE.local.md` (non versionné). Les scripts `.claude/workflows/malta-*.js` restent sur le poste, ignorés par git.
- Détail de la journée : `journal/2026-11-24.md` (une section par étape).

## Production

- https://cocooning.<tailnet>.ts.net (vrai nom dans `CLAUDE.local.md`), VM Oracle `cadence` (`ssh cadence`), clone de `main` du nouveau dépôt dans `~/cocooning` (clé de déploiement en lecture seule), secrets dans `~/cocooning/infrastructure/compose/.env`, `pg_dump` nocturne dans `~/backups`. Procédure : `docs/platform/runbooks/deployment/production.md` (test de `/collab` en `curl --http1.1 -sv`). Un build dure 12 à 15 minutes.

## Prochaine étape

1. **Essai sur les deux téléphones** de la release PR #9 (2026-11-24) : « Aujourd'hui » change le jour sans faire défiler (choix du propriétaire, PR #8 annule #5) ; feuille de l'agenda, titre visible au-dessus du clavier, défilement qui ne la replie plus (poignée seule) ; glissement vers la gauche (à moitié : bouton « Supprimer » ; au-delà de 60 % : suppression au lâcher, décision 0049). Si le titre reste caché : faire suivre à la feuille la hauteur de `visualViewport`.
2. **Autres retours du couple**, une petite PR chacun : sélecteurs natifs, place du « + », points de couleur, événement privé invisible chez l'autre, barre d'onglets, compteur « Nous » (2 969 jours attendus le 2026-11-24), écriture à deux dans une note, bandes système blanches du Samsung.
3. **Messages** : règles écrites (décision 0050). Découpage validé (« go ») : A fil (PR #13, mergée), B en cours sur `feat/messaging-photo-prompt` (sous-agent ; relire, revérifier, signaler une éventuelle variable d'environnement du `env.ts` du module), B photo du jour (R7 à R9, tâche planifiée dans l'API), C notifications (abonnements, relais de l'outbox messages/agenda/notes, Web Push VAPID), D client, E écran, F notifications dans la PWA. Backend par sous-agent avec brief complet, relu et revérifié avant la PR. À confirmer : formats et 10 Mo des photos (R3). Nouvelle variable `FILE_STORAGE_DIRECTORY` (volume `files` en prod, ajoutée au `.env` local). À faire à part : agenda (et notes ?) répondent 500 au lieu de 409 quand une suppression croise une sauvegarde ; sauvegarde nocturne sans les photos ; un test E2E instable vu une fois.
4. **Plus tard, si le couple le veut** : prénoms dans « Nous » (l'API ne les connaît pas), répétition annuelle dans l'agenda.

Mode de travail : pas d'autonomie. Une PR à la fois, résumée au propriétaire ; merger seulement après son « go » ; supprimer la branche après merge, en local et sur GitHub. Le backend et le client se confient bien à un sous-agent avec un brief complet, relu avant la PR ; l'interface se maquette d'abord sur la planche.

**Avant chaque commit** : `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine, puis `pnpm --filter couple-api test:e2e`. Entrée CommonJS de toute dépendance vérifiée (D31), versions dans les catalogues de `pnpm-workspace.yaml`. Jamais de donnée personnelle (adresse, date, mot de passe), de chemin local ni de tailnet dans le dépôt : le dépôt est public.

## Décisions qui bloquent

- Écart frontend 006 : l'adaptateur Hocuspocus vit dans le module web `notes`, contre la décision 0040 ; une décision est à proposer.
- D26 (tailles de fichiers) : `couple.aggregate.ts` 156 lignes, `note.aggregate.ts` 150, gateways client ~150 (`api-notes`, `api-agenda`), nombreuses specs au-delà de 100 lignes.
- À proposer : mise en commun de `primary/couple/` et `PairedCouplePrismaProvider` (copiés de notes dans agenda, ~75 lignes), `isClockTime` dans le shared-kernel.
- Écarts ouverts aussi : frontend 003 (routes et containers sans test) et 005 (liste limitée à 100 notes), authentication 001 et 003.

## Fichiers chauds

- `apps/couple/web/src/modules/agenda/`, `apps/couple/web/src/app/(tabs)/`, `packages/design-system/src/ui/`
- `packages/couple/server-business-logic/src/agenda/`, `apps/couple/api/src/modules/agenda/`
- `CLAUDE.local.md` (local), `docs/platform/decisions/0018-depot-public-historique-nettoye.md`

## Dépôt

- Public `Thomas-DE-SOUSA/cocooning`, `dev` par défaut, `main` stable, une branche par changement depuis `dev` (D23). Pas de protection de branche (D29 ouverte).
- `_malta-blueprint/` reste en local, hors git (B1, décision plateforme 0018).

## Points d'attention

- Le couple du propriétaire et de Pauline est formé en production ; leurs deux périodes ensemble sont en base, jamais dans le dépôt.
- Malta est en lecture seule ; le blueprint contient du code propriétaire : ne jamais le publier.
- `.env` locaux : lecture interdite par une règle de permission ; le propriétaire autorise à y ajouter une variable sans demander. Celui de la VM se modifie par `ssh cadence`, seulement pour une release validée.
- Le scope de commit `infra` n'existe pas : un changement de `infrastructure/` lié à un contexte prend son scope.
