# État du projet

> Mis à jour : 2026-11-25 (release #24 en production ; lot 2 : serveur en PR, nouvelles variables, clé à changer avant la release).
> Ce fichier est réécrit, jamais allongé (60 lignes au plus). L'historique est dans `journal/`.

## Où on en est

- **En production** (VM, release PR #24, 2026-11-25) : notes à deux en direct, DA « Lin et terre cuite », onglets Notes, Agenda, Messages, Nous, compteur dans « Nous », agenda complet (décisions 0046 à 0049), messages (fil en ordre de chat, mots flash, photos, invitation du jour, décisions 0050, 0051), dossiers de notes lot 1 (espaces Partagé / Privé, dossiers, déplacement, décisions 0052, 0053), notifications (service worker, carte dans « Nous »). Clés VAPID dans le `.env` de la VM (copie `.env.backup-2026-11-25`).
- **Dépôt public depuis le 2026-11-24** (décision plateforme 0018) : https://github.com/Thomas-DE-SOUSA/cocooning, historique réécrit (e-mail d'un compte, nom de l'éditeur de Malta, chemins, tailnet retirés ; scripts Malta hors git). L'ancien dépôt, avec les PR #1 à #103, est `cocooning-archive` (privé, ne jamais le rendre public). Les numéros de PR repartent de 1.
- **Chemins locaux, tailnet, URL de production réelle** : `CLAUDE.local.md` (non versionné). Les scripts `.claude/workflows/malta-*.js` restent sur le poste, ignorés par git.
- Détail de la journée : `journal/2026-11-24.md` (une section par étape).

## Production

- https://cocooning.<tailnet>.ts.net (vrai nom dans `CLAUDE.local.md`), VM Oracle `cadence` (`ssh cadence`), clone de `main` du nouveau dépôt dans `~/cocooning` (clé de déploiement en lecture seule), secrets dans `~/cocooning/infrastructure/compose/.env`, `pg_dump` nocturne dans `~/backups`. Procédure : `docs/platform/runbooks/deployment/production.md` (test de `/collab` en `curl --http1.1 -sv`). Un build dure 12 à 15 minutes.

## Prochaine étape

1. **Essai sur les deux téléphones** de la release PR #9 (2026-11-24) : « Aujourd'hui » change le jour sans faire défiler (choix du propriétaire, PR #8 annule #5) ; feuille de l'agenda, titre visible au-dessus du clavier, défilement qui ne la replie plus (poignée seule) ; glissement vers la gauche (à moitié : bouton « Supprimer » ; au-delà de 60 % : suppression au lâcher, décision 0049). Si le titre reste caché : faire suivre à la feuille la hauteur de `visualViewport`.
2. **Autres retours du couple**, une petite PR chacun : sélecteurs natifs, place du « + », points de couleur, événement privé invisible chez l'autre, barre d'onglets, compteur « Nous » (2 969 jours attendus le 2026-11-24), écriture à deux dans une note, bandes système blanches du Samsung.
3. **Messages** (décisions 0050, 0051) : A à E mergées (#13 à #18) ; le fil est dans l'ordre d'une messagerie (choix du propriétaire, 2026-11-25), le schéma photo inutilisé est retiré. Release après F (choix du propriétaire) : générer une paire VAPID pour la VM avec son accord (sinon l'API ne démarre pas). F ouverte : service worker (phrase par genre depuis `fr/messaging/push.json`, toucher → bon écran), carte « Notifications sur ce téléphone » dans « Nous » (port `PhonePushGateway`). À vérifier sur iPhone : abonnement après la lecture de la clé publique (sinon charger la clé à l'ouverture de la carte). À vérifier sur téléphone : clavier iOS sur le composeur, appareil photo, HEIC sur Samsung, photo de 10 Mo. À faire à part : agenda/notes 500 au lieu de 409 ; sauvegarde nocturne sans les photos ; R3 à confirmer.
4. **Dossiers de notes et dossiers IA** (D53, décision 0052 acceptée le 2026-11-25, PR #19) : règles R10 à R25 des notes, Gemini gratuit avec risque accepté, lot 2 sans tri, « Modifiées récemment » gardé ; planche `Notes-concept` et `Notes-dossiers`. Lot 1, dossiers classiques : backend mergé (#20 : `Folder`, sept routes, codes `FOLDER_*` dans `NoteException`) ; client mergé (#21 : port `NoteFoldersGateway`, sept use cases, `createFolderNameFormSchema`, `FakeNoteFoldersGateway`, `CreateNoteUseCase(form, destination)`) ; écran : maquette complémentaire `Notes-actions` (« ⋯ », suppression qui dit où remonte le contenu, déplacer par espace puis dossier, partager / rendre privée remplacés par le déplacement) validée (« go », 2026-11-25, décision 0053) ; écran mergé (#22, 12 commits atomiques, chacun vérifié aux types) : accueil Partagé / Privé et « Modifiées récemment », espace ou dossier, « + », « ⋯ », déplacement ; partager / rendre privée retirés de la PWA et du client. À essayer sur téléphone : clavier iOS dans les feuilles, enchaînement des feuilles vaul, toucher hors du menu « + ». Limite connue : course rare suppression/création dans un dossier, sans verrou. Lot 2 bloqué : la clé Gemini gratuite marche sans recherche, mais la recherche Google est refusée en gratuit (429) et Gemini 2.5 est fermé aux nouveaux comptes ; le propriétaire choisit « A » : SearXNG sur la VM + Gemini gratuit ; décision technique 0054 acceptée (#25) ; serveur du lot 2 mergé (#26, 7 commits atomiques, chacun repassé aux types ; 558 tests métier, 317 E2E ; vrai Gemini essayé avec la forme de requête de l'adaptateur : JSON correct, `null` pour non trouvé ; 503 « high demand » parfois → fiche `FAILED`, à réessayer). Choix confirmés par « go » (2026-11-25) : sous-dossier → fiche type du dossier IA le plus proche, nouvelles cases vides jusqu'à « Mettre à jour », recherche comptée même si elle échoue. SearXNG local : Google bon, DuckDuckGo et Qwant bloqués. La clé d'essai collée dans la conversation est à changer avant la mise en production. Agenda « qui est concerné » pour plus tard (D52).
5. **Plus tard, si le couple le veut** : prénoms dans « Nous » (l'API ne les connaît pas), répétition annuelle dans l'agenda.

Mode de travail : pas d'autonomie. Une PR à la fois, résumée au propriétaire ; merger seulement après son « go » ; supprimer la branche après merge, en local et sur GitHub. Le backend et le client se confient bien à un sous-agent avec un brief complet, relu avant la PR ; l'interface se maquette d'abord sur la planche.

**Avant chaque commit** : `pnpm check-types && pnpm lint && pnpm test && pnpm build` à la racine, puis `pnpm --filter couple-api test:e2e`. Entrée CommonJS de toute dépendance vérifiée (D31), versions dans les catalogues de `pnpm-workspace.yaml`. Jamais de donnée personnelle (adresse, date, mot de passe), de chemin local ni de tailnet dans le dépôt : le dépôt est public.

## Décisions qui bloquent

- Écart frontend 006 : l'adaptateur Hocuspocus vit dans le module web `notes`, contre la décision 0040 ; une décision est à proposer.
- D26 (tailles de fichiers) : `couple.aggregate.ts` 156 lignes, `note.aggregate.ts` 150, gateways client ~150 (`api-notes`, `api-agenda`), nombreuses specs au-delà de 100 lignes.
- À proposer : mise en commun de `primary/couple/` et `PairedCouplePrismaProvider` (copiés de notes dans agenda, ~75 lignes), `isClockTime` dans le shared-kernel.
- Écarts ouverts aussi : frontend 003 (routes et containers sans test ; hooks de composition des dossiers ajoutés) ; 005 clos (l'accueil lit 5 notes), authentication 001 et 003.

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
