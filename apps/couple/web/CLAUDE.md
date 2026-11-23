# couple-web

PWA Next.js 16 (App Router, Turbopack) du couple, servie en dev sur le port 3200. Aujourd'hui : le socle (`src/app/` : layout racine, `Provider`, accueil provisoire, `not-found`, `global-error`), la traduction en francais (`src/i18n/`) et l'installation sur le telephone (`manifest.ts`, icones provisoires, service worker `sw.ts` de Serwist, page hors ligne `~offline/`). Premier ecran : la connexion (`src/modules/authentication/`, route `src/app/sign-in/`), avec `src/proxy.ts` qui renvoie vers elle sans cookie de session. Les ecrans arrivent par modules dans `src/modules/<module>/` (Feature Module Pattern, decision 0011) ; module de reference : `src/modules/authentication/`.

## A lire avant de commencer

Regles front communes :
@../../../_knowledge/core-frontend.md

## Consignes de code

- Langue : francais seul (choix du proprietaire, 2026-11-23). `I18N_CONFIG.supportedLocales` et la spec de parite des cles restent en place : ajouter une langue = un dossier `src/i18n/locales/<langue>/` et une entree dans `RESOURCES`.
- Traductions chargees par imports statiques dans `src/i18n/resources.ts` (`core.md rule 23`, pas d'`import()` dynamique). Un namespace = un fichier JSON, ajoute a `RESOURCES`.
- Composant serveur : `const t = await getServerTranslation('<namespace>')` (une instance i18next par appel). Composant client : `useTranslation('<namespace>')` de `react-i18next`, sous le `Provider` de `src/app/provider.tsx`.
- Aucune URL en dur : `WebRouterEnum` de `@cocooning/couple-shared-kernel/routers` (modele : `src/app/not-found.tsx`).
- `process.env` est interdit hors de `src/env/` (lint `next.js`). Une variable serveur : son schema dans `src/env/server.ts` (`@t3-oss/env-nextjs`, `server-only`), son `.env.example`, la liste `env` de `turbo.json` et le bloc `environment` de `web` du compose de prod, dans le meme commit. Aujourd'hui : `API_URL`, `API_TIMEOUT_MS`.
- Une route (`src/app/`) importe seulement le point d'entree d'un module (`@/modules/<module>`) ou `src/shared/` (decision 0011).
- Erreur serveur : `toast.error(titre, { description: describeApiResultError(error, t) })`, jamais `error.message` (decision 0010, `src/shared/application/api-result/`).
- Formulaire : react-hook-form et `zodResolver`, server action qui rend un `Result` (decision 0035, modele `src/modules/authentication/`).
- Composants d'interface : `@cocooning/design-system`, jamais une copie locale. Couleurs par les tokens (`bg-primary`, `text-muted-foreground`), jamais en dur.
- `*.tsx` : 125 lignes visees, 200 au plus (decision 0008).
- Couleurs du telephone (manifeste, `viewport.themeColor`) : `src/app/pwa-theme.ts`, copie en hexadecimal des tokens oklch du design system. Un token de fond change : le reporter ici.
- Une icone ajoutee au manifeste : le fichier dans `public/icons/` ; `src/app/manifest.spec.ts` refuse une icone absente du disque.

## Tests

- Composant client sous traduction : l'envelopper dans `WithI18n` (`src/testing/with-i18n.tsx`), le vrai provider, pas un mock.
- Specs a cote du fichier, `*.spec.tsx` en jsdom avec Testing Library, style BDD, sans `should`.
- Composant serveur async : `render(await Page())` (modele : `src/app/page.spec.tsx`).
- `src/i18n/__tests__/locale-files.spec.ts` refuse un `{placeholder}` a accolade simple et des cles qui different entre langues.

## Pieges

- `src/env/server.ts` est valide au demarrage (`src/instrumentation.ts`) et `onValidationError` quitte le processus : sans lui, Next journalise l'erreur et continue de repondre 500. `next build` ne la lit pas, l'image Docker se construit sans elle.
- `@t3-oss/env-nextjs` est livre en ESM seul : `jest.config.mjs` le compile en CommonJS (`transform`, `transformIgnorePatterns`). `server-only` est remplace dans Jest par `src/testing/server-only-stub.ts`.
- Une spec ne charge pas une route qui monte un container : la chaine importe la server action et `serverEnv`, que t3-env refuse sous jsdom. Tester la vue, les hooks et les services.
- `proxy.ts` : le `matcher` est ecrit en litteraux (Next l'analyse au build et ignore une variable). Les routes publiques passent par `WebRouterEnum` dans le code. Un fichier de la PWA ajoute dans `public/` (demande sans cookie) : l'exclure du `matcher` et de sa spec.
- Server action et proxy inverse : Next compare `Origin` a `X-Forwarded-Host` (ou `Host`) et refuse sinon ("Invalid Server Actions request"). Derriere `tailscale serve` sur la VM, a verifier au premier deploiement de l'ecran ; sinon `serverActions.allowedOrigins` dans `next.config.ts`.
- `next-env.d.ts` est regenere par `next build` et n'est pas versionne ; `check-types` passe sans lui.
- Le design system est lu depuis ses `src` (`transpilePackages` dans `next.config.ts`) ; les autres packages internes depuis leur `dist`, construit avant par turbo (`^build`).
- Jest ne passe pas par Next : `@/`, les packages internes et les `.css` sont mappes dans `jest.config.mjs`. Un nouveau package interne importe par l'app y recoit sa ligne.
- `global-error.tsx` remplace le layout racine : il pose lui-meme `<html>`, `<body>` et l'`I18nProvider`.
- `next lint` n'existe plus : `pnpm lint` lance `eslint .`.
- Service worker (decision plateforme 0014) : `@serwist/next` est un plugin webpack. `pnpm build` lance `next build --webpack` ; `next.config.ts` n'applique le plugin qu'a `PHASE_PRODUCTION_BUILD`, sinon `next dev` (Turbopack) refuse de demarrer. Pas de service worker en dev : tester cache et hors ligne avec `pnpm --filter couple-web build && pnpm --filter couple-web start`.
- `public/sw.js*` et `public/swe-worker-*` sont generes par le build : ignores par git et ESLint, sorties de `turbo.json`. Ne jamais les editer.
- `sw.ts` tourne dans le navigateur, hors de React : pas de `t()`, pas de `@/` qui tire du code serveur. Il importe seulement `serwist`, `@serwist/next/worker` et `WebRouterEnum`.
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
- Choix du service worker, build webpack : decision plateforme 0014 (`docs/platform/decisions/0014-socle-technique-de-la-pwa.md`), remplacee par une nouvelle decision si la variante change.
- Module ajoute : son `CLAUDE.md` au format `docs/templates/claude-web-submodule.md` s'il a un pendant backend.
- Variable ajoutee : `docs/guides/local-setup.md` et `docs/platform/runbooks/deployment/production.md`.
- Session, proxy ou cookie : section "La session dans la PWA" de `docs/couple/architecture/frontend/index.md`.
