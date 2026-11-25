# couple-web

PWA Next.js 16 (App Router, Turbopack) du couple, servie en dev sur le port 3200. Aujourd'hui : le socle (`src/app/` : layout racine, `Provider`, `not-found`, `global-error`), la traduction en francais (`src/i18n/`) et l'installation sur le telephone (`manifest.ts`, icones provisoires, service worker `sw.ts` de Serwist, page hors ligne `~offline/`). Ecrans : la connexion et la deconnexion (`src/modules/authentication/`, route `src/app/sign-in/`), avec `src/proxy.ts` qui renvoie vers elle sans cookie de session, la mise en couple (`src/modules/pairing/`, route `src/app/pairing/`), vers laquelle l'accueil renvoie tant que le couple n'est pas forme, et les notes (`src/modules/notes/`), dont l'accueil montre les deux espaces et les notes modifiees recemment (route `src/app/(tabs)/(home)/`, groupe sans segment pour que son `loading.tsx` ne couvre pas les autres pages), dont chaque espace et chaque dossier a son ecran (`src/app/(tabs)/spaces/[space]/`, decision 0053) et dont chaque note a sa page (`src/app/notes/[noteId]/`), et l'agenda (`src/modules/agenda/`, route `src/app/(tabs)/agenda/`, grille du mois et evenements du jour choisi, decision 0048, creation, modification, visibilite et suppression d'un evenement dans une feuille qui monte du bas), et les messages (`src/modules/messaging/`, route `src/app/(tabs)/messages/`, fil du couple, mots flash, photos et invitation photo du jour ; les octets d'une photo passent par le route handler `src/app/api/instant-photos/[instantPhotoId]/`). Barre d'onglets (decision 0044) : le groupe `src/app/(tabs)/` (`layout.tsx`, `main-navigation.tsx`) la pose sur l'accueil, sur l'ecran d'un espace des notes, sur l'onglet "Agenda", sur l'onglet "Messages" et sur l'onglet "Nous" (`src/app/(tabs)/couple/`, couple du module `pairing`, notifications de ce telephone du module `messaging`, deconnexion du module `authentication`) ; la page d'une note, la connexion et la mise en couple n'en ont pas. Partage entre modules : `src/shared/ui/command-button.tsx` (bouton d'une commande), `src/shared/ui/tab-bar.tsx` (barre d'onglets, sans `next/navigation`), `src/shared/ui/unavailable-notice.tsx` (donnees illisibles, bouton reessayer) et `src/shared/application/refresh/` (relecture au retour au premier plan). Les ecrans arrivent par modules dans `src/modules/<module>/` (Feature Module Pattern, decision 0011) ; module de reference : `src/modules/authentication/`.

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Langue : francais seul (choix du proprietaire, 2026-11-23). `I18N_CONFIG.supportedLocales` et la spec de parite des cles restent en place : ajouter une langue = un dossier `src/i18n/locales/<langue>/` et une entree dans `RESOURCES`.
- Traductions chargees par imports statiques dans `src/i18n/resources.ts` (`core.md rule 23`, pas d'`import()` dynamique). Un namespace = un fichier JSON, ajoute a `RESOURCES`.
- Composant serveur : `const t = await getServerTranslation('<namespace>')` (une instance i18next par appel). Composant client : `useTranslation('<namespace>')` de `react-i18next`, sous le `Provider` de `src/app/provider.tsx`.
- Aucune URL en dur : `WebRouterEnum` de `@cocooning/couple-shared-kernel/routers` (modele : `src/app/not-found.tsx`).
- `process.env` est interdit hors de `src/env/` (lint `next.js`). Une variable serveur : son schema dans `src/env/server.ts` (`@t3-oss/env-nextjs`, `server-only`), son `.env.example`, le bloc `environment` de `web` du compose de prod (et `infrastructure/compose/.env.example` si la valeur depend du tailnet), dans le meme commit. Aujourd'hui : `API_URL`, `API_TIMEOUT_MS`, `NOTES_COLLABORATION_URL` (lue par `noteCollaborationUrl()` du module `notes`, passee par la page au navigateur).
- Une route (`src/app/`) importe seulement le point d'entree d'un module (`@/modules/<module>`) ou `src/shared/` (decision 0011) ; `src/shared/` n'importe aucun module. Le lint (`config/eslint-config/feature-modules.js`) refuse `@/modules/<module>/...` et un chemin relatif vers l'interieur d'un module, un import de `@/modules` dans `src/shared/`, un hook autre que `useTranslation`/`useForm` (y compris `use(...)`) ou un import de `next/navigation`, `gateways`, `actions`, `services`, `hooks` dans une vue, un import d'une server action dans `hooks/` (`core-frontend.md` regle 21), et un `toast.error` qui lit `.message` dans tout `src/`.
- Erreur serveur : `toast.error(titre, { description: describeApiResultError(error, t) })`, jamais `error.message` (decision 0010, `src/shared/application/api-result/`).
- Formulaire : react-hook-form et `zodResolver`, server action qui rend un `Result` (decision 0035, modele `src/modules/authentication/`).
- Gateway `server-action/` d'un module : chaque appel passe par `runServerAction(action, UNREACHABLE)` (`src/shared/application/server-action/`), qui rend `NETWORK_ERROR` quand l'action rejette et recharge la page quand elle date d'avant un deploiement. Jamais de `try/catch` recopie dans un module.
- Composants d'interface : `@cocooning/design-system`, jamais une copie locale. Couleurs par les tokens (`bg-primary`, `text-muted-foreground`), jamais en dur.
- Un ecran a onglet : sa route dans `src/app/(tabs)/`, une entree dans `TABS` de `main-navigation.tsx`, son libelle `navigation.<onglet>` dans `generic.json` ; pas d'onglet avant que l'ecran existe (decision 0044). L'onglet reste actif sur chaque route de son entree (`routes`, `isActiveTab` de `active-tab.ts` : une route a parametre couvre toutes les adresses sous sa tete fixe), ainsi "Notes" sur l'accueil, un espace et la page d'une note (decision 0053).
- Allure (decision plateforme 0017, `docs/design/tokens.md`) : page en `px-5`, titre `h1` en `text-3xl font-semibold` (Fraunces par defaut), chaque bloc d'un ecran dans une `Card`, une action principale en `primary`, les autres en `outline`, une action discrete en `ghost`.
- `*.tsx` : 125 lignes visees, 200 au plus (decision 0008).
- Couleurs du telephone (manifeste, `viewport.themeColor`) : `src/app/pwa-theme.ts`, copie des tokens de fond du design system. Un token de fond change : le reporter ici.
- Polices : `src/app/fonts.ts` (`next/font/google`, Fraunces et Inter), dont les variables vont sur `<html>` dans `layout.tsx` et `global-error.tsx`. Aucun `<link>` vers Google (decision plateforme 0017).
- Une icone ajoutee au manifeste : le fichier dans `public/icons/` ; `src/app/manifest.spec.ts` refuse une icone absente du disque.

## Tests

- Composant client sous traduction : l'envelopper dans `WithI18n` (`src/testing/with-i18n.tsx`), le vrai provider, pas un mock.
- Specs a cote du fichier, `*.spec.tsx` en jsdom avec Testing Library, style BDD, sans `should`.
- Composant serveur async : `render(await Page())` (modele : `src/app/~offline/page.spec.tsx`). Une page qui lit l'API monte un container : voir le piege t3-env ci-dessous et l'ecart frontend 003.
- `src/i18n/__tests__/locale-files.spec.ts` refuse un `{placeholder}` a accolade simple et des cles qui different entre langues.

## Pieges

- `src/env/server.ts` est valide au demarrage (`src/instrumentation.ts`) et `onValidationError` quitte le processus : sans lui, Next journalise l'erreur et continue de repondre 500. `next build` charge les pages qui lisent l'API ("Collecting page data") : la validation y est sautee (`NEXT_PHASE`), et les fabriques de modules sont des fonctions appelees a la requete (`pairingModule()`, `authenticationModule()`, `notesModule()`, `agendaModule()`, `messagingModule()`), jamais des constantes lues a l'import.
- Une page qui lit les donnees du partenaire porte `export const dynamic = 'force-dynamic'` : sinon Next la prerend au build, sans cookie ni variables.
- Lire la session cote serveur : `getSessionToken()` (`src/shared/application/session/`), passe non resolu aux fabriques (decision 0036). `next build` ne la lit pas, l'image Docker se construit sans elle.
- `@t3-oss/env-nextjs` est livre en ESM seul : `jest.config.mjs` le compile en CommonJS (`transform`, `transformIgnorePatterns`). `server-only` est remplace dans Jest par `src/testing/server-only-stub.ts`.
- Une spec ne charge pas une route qui monte un container : la chaine importe la server action et `serverEnv`, que t3-env refuse sous jsdom. Tester la vue, les hooks et les services. Un route handler aussi : sa logique va dans un service sans fabrique (modele : `services/instant-photo-file.service.ts` de `messaging`).
- Le `File` de jsdom n'a pas `arrayBuffer()` : une spec qui lit les octets d'un `File` tourne en `@jest-environment node`.
- `next/image` plutot que `<img>` (`@next/next/no-img-element`, et `--max-warnings=0`) : `unoptimized` pour une photo du couple ou une URL `blob:`, jamais l'optimiseur de Next, qui garderait une copie.
- `proxy.ts` : le `matcher` est ecrit en litteraux (Next l'analyse au build et ignore une variable). Les routes publiques passent par `WebRouterEnum` dans le code. Un fichier de la PWA ajoute dans `public/` (demande sans cookie) : l'exclure du `matcher` et de sa spec. Les route handlers `app/api/**` restent dans le `matcher` : sans cookie, ils renvoient vers la connexion comme une page.
- Server action et proxy inverse : Next compare `Origin` a `X-Forwarded-Host` (ou `Host`) et refuse sinon ("Invalid Server Actions request"). Derriere `tailscale serve` sur la VM, verifie le 2026-11-23 (releases #39 et #50) : `X-Forwarded-Host` passe, `serverActions.allowedOrigins` est inutile. Ne l'ajouter que si "Invalid Server Actions request" apparait dans les logs du web.
- `next-env.d.ts` est regenere par `next build` et n'est pas versionne ; `check-types` passe sans lui.
- Le design system est lu depuis ses `src` (`transpilePackages` dans `next.config.ts`) ; les autres packages internes depuis leur `dist`, construit avant par turbo (`^build`).
- jsdom n'a pas `ResizeObserver` : `src/testing/resize-observer-stub.ts` (`setupFiles` de `jest.config.mjs`) le remplace, Radix mesure avec lui un `Switch` pose dans un formulaire.
- Jest ne passe pas par Next : `@/`, les packages internes et les `.css` sont mappes dans `jest.config.mjs`. Un nouveau package interne importe par l'app y recoit sa ligne.
- `global-error.tsx` remplace le layout racine : il pose lui-meme `<html>` (avec `FONT_VARIABLES`), `<body>` et l'`I18nProvider`.
- `next/font/google` telecharge les polices pendant `next build` : sans acces a `fonts.gstatic.com`, le build passe quand meme avec un simple message `getaddrinfo ENOTFOUND`, et l'app retombe sur les polices du systeme. Jest remplace `next/font/google` par `src/testing/next-font-stub.ts`.
- `next lint` n'existe plus : `pnpm lint` lance `eslint .`.
- Service worker (decision plateforme 0014) : `@serwist/next` est un plugin webpack. `pnpm build` lance `next build --webpack` ; `next.config.ts` n'applique le plugin qu'a `PHASE_PRODUCTION_BUILD`, sinon `next dev` (Turbopack) refuse de demarrer. Pas de service worker en dev : tester cache et hors ligne avec `pnpm --filter couple-web build && pnpm --filter couple-web start`.
- `public/sw.js*` et `public/swe-worker-*` sont generes par le build : ignores par git et ESLint, sorties de `turbo.json`. Ne jamais les editer.
- `sw.ts` tourne dans le navigateur, hors de React : pas de `t()`, pas de `@/` qui tire du code serveur. Il importe seulement `serwist`, `@serwist/next/worker`, `WebRouterEnum` et ses fichiers voisins `./sw-*` : `sw-page-request.ts`, `sw-push-notification.ts` (qui lit `PushNotificationKindEnum` et, en import statique par chemin relatif, les JSON `generic.json` et `messaging/push.json` : le build webpack du service worker les embarque) et `sw-notification-click.ts`. Leur logique est pure et testee a cote ; `sw.ts` ne fait que brancher les ecouteurs.
- Notifications (R10 de `messaging`, decision 0051) : l'ecouteur `push` de `sw.ts` lit `{ kind }` par `pushNotificationOf` (`sw-push-notification.ts`), qui donne le titre (`app.name`), la phrase du genre (`notification.<KIND>` de `messaging/push.json`), le `tag` (le genre : une notification du meme genre remplace la precedente) et l'ecran a ouvrir ; une charge illisible ou d'un genre inconnu montre quand meme `notification.generic` (une notification visible est obligatoire avec `userVisibleOnly`). L'ecouteur `notificationclick` ferme la notification et passe par `openAppAt` (`sw-notification-click.ts`) : la fenetre de l'app au premier plan, sinon la premiere, est ramenee devant et naviguee vers l'ecran, sinon une fenetre s'ouvre. `notificationUrlOf` n'accepte que les ecrans connus. Pas de `badge` : il faudrait une icone monochrome, une icone pleine donnerait un carre blanc sur Android.
- Aucune page ni charge RSC en cache (decision 0036) : la route `NetworkOnly` de `isPageRequest` passe avant `defaultCache`, et l'activation supprime les caches `pages*` et `others` d'une version precedente. Une page lisible hors ligne demande une nouvelle decision, avec purge a la deconnexion. Les photos du couple suivent la meme regle : `isInstantPhotoRequest` (`sw-page-request.ts`) met `WebRouterEnum.INSTANT_PHOTO_FILE` en `NetworkOnly` avant `defaultCache` (dont la route `/api/` mettrait les reponses en cache), et le route handler repond `Cache-Control: private, no-store`. Toute autre route `app/api/**` qui sert des donnees du couple recoit le meme traitement.
- Corps d'une requete : Next refuse un corps de server action au-dela de 1 Mo et le proxy (`proxy.ts`) coupe un corps au-dela de 10 Mo. `next.config.ts` releve les deux (`experimental.serverActions.bodySizeLimit`, `experimental.proxyClientMaxBodySize`) a `INSTANT_PHOTO_REQUEST_BODY_LIMIT` pour une photo de 10 Mo (R3 de `messaging`) et son enveloppe multipart.
- `reloadOnOnline: false` (`next.config.ts`) : le retour du reseau ne recharge pas la page, qui viderait un formulaire ; les ecrans se relisent au retour au premier plan.
- `skipWaiting` et `clientsClaim` : une nouvelle version du service worker prend la main sans attendre la fermeture des onglets. En cas d'ecran incoherent apres un deploiement, recharger la page ; en dernier recours, desinscrire le service worker dans les outils du navigateur.
- La page `~offline` est precachee par `additionalPrecacheEntries` (`next.config.ts`), avec une revision nouvelle a chaque build. Une autre page de repli doit y etre ajoutee aussi.
- Le service worker ne s'enregistre qu'en HTTPS (ou sur `localhost`) : sur le telephone, passer par `tailscale serve` (`docs/guides/local-setup.md`).
- `.next/dev/types` est exclu de `tsconfig.json` : le validateur genere par `next dev` importe des types inutilises et casse `check-types` (`noUnusedLocals`).
- `agentRules: false` dans `next.config.ts` : sinon `next dev` ecrit un `AGENTS.md` ; les consignes d'agent de l'app sont ce fichier.

## Commandes

- `pnpm --filter couple-web dev` (http://localhost:3200, `apps/couple/web/.env` copie de `.env.example`, API demarree)
- `pnpm --filter couple-web test`
- `pnpm --filter couple-web check-types`
- `pnpm --filter couple-web lint`
- `pnpm --filter couple-web build` (webpack, produit `public/sw.js`)
- `pnpm --filter couple-web start` (sert le build sur le port 3200, service worker compris)

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou le composant modifies, trouvee avec `rg -l '<NomDeComposant>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Chemin d'un appel, packages front : `docs/couple/architecture/frontend/index.md`.
- Port, commandes, variables, essai sur le telephone : `docs/guides/local-setup.md`.
- Polices, couleurs du telephone : `docs/design/tokens.md`.
- Choix du service worker, build webpack : decision plateforme 0014 (`docs/platform/decisions/0014-socle-technique-de-la-pwa.md`), remplacee par une nouvelle decision si la variante change.
- Module ajoute : son `CLAUDE.md` au format `docs/templates/claude-web-submodule.md` s'il a un pendant backend.
- Variable ajoutee : `docs/guides/local-setup.md` et `docs/platform/runbooks/deployment/production.md`.
- Session, proxy ou cookie : section "La session dans la PWA" de `docs/couple/architecture/frontend/index.md`.
