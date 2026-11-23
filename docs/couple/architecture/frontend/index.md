# Front de la PWA

Comment la PWA `apps/couple/web` parle à l'API, et ce que porte chaque package front. Les règles de code front sont dans `_knowledge/core-frontend.md`.

## Les packages

| Package | Rôle | Peut importer |
|---|---|---|
| `@cocooning/couple-client-business-logic` | Logique métier front sans framework : ports des gateways, use cases, schémas de formulaire, presenters. Aujourd'hui : `ApiError` et `Translator` (`shared`), pour `authentication` le formulaire de connexion (`createSignInFormSchema`), le port `AuthenticationGateway` et `SignInUseCase`, et pour `pairing` le port `PairingGateway`, les cinq use cases de la mise en couple (`GetMyCoupleUseCase` rend `null` quand le partenaire n'a pas de couple, `CancelCoupleUseCase` annule un couple en attente) et `createJoinCoupleFormSchema` | `shared-kernel`, `couple-shared-kernel`, `couple-contract`, zod |
| `@cocooning/client-infrastructure` | Le seul `fetch` des gateways (`httpRequest`), la vérification d'une réponse par son contrat (`parseResponse`), `resolveRoute`, et le faux `fetch` des specs (`FakeFetch`, sous-chemin `testing`) | `shared-kernel`, zod |
| `@cocooning/couple-client-infrastructure` | Les gateways du couple, leur configuration HTTP commune (`createCoupleHttpConfig`) et la fabrique de chaque contexte. Aujourd'hui : `ApiAuthenticationGateway` et `createAuthenticationModule` (`authentication`), `ApiPairingGateway` et `createPairingModule` (`pairing`), et `sessionRequest`, qui renvoie la session du partenaire à l'API dans l'en-tête `Cookie` (`sessionHeaders`) ([décision 0036](../../decisions/frontend/0036-lecture-des-donnees-par-la-page-serveur.md)) | les trois précédents, `couple-contract` |
| `@cocooning/design-system` | Composants d'interface sans domaine et couleurs du thème (clair et sombre selon le téléphone). Aujourd'hui : `Button`, `Field` et `FieldError`, `Input`, `Label`, `Skeleton`, `Spinner`, `Toaster` | React, Tailwind |
| `apps/couple/web` | Pages, server actions, containers et vues. Aujourd'hui : layout racine, accueil provisoire (réservé à un couple formé), pages d'erreur, traduction en français (`src/i18n/`), manifeste, service worker et page hors ligne, `proxy.ts`, écran de connexion (module `authentication`), mise en couple (module `pairing`), descripteur des erreurs serveur (`src/shared/application/api-result/`) | tout ce qui précède |

ESLint (`config/eslint-config/boundaries.js`) refuse les imports qui sortent de cette table : `client-business-logic` n'importe ni React, ni Next, ni un adaptateur. Dans `apps/couple/web`, `config/eslint-config/feature-modules.js` tient les règles des modules : vues pures ([décision 0009](../../decisions/frontend/0009-use-translation-dans-les-vues.md)), erreurs serveur par le descripteur unique ([décision 0010](../../decisions/frontend/0010-affichage-erreur-serveur.md)), un module n'importe d'un autre que son point d'entrée ([décision 0011](../../decisions/frontend/0011-pwa-rangee-par-fonctionnalite.md)).

## L'installation sur le téléphone

La PWA s'installe sur l'écran d'accueil ([décision plateforme 0007](../../../platform/decisions/0007-pwa-sans-application-native.md)) :

| Fichier de `apps/couple/web` | Rôle |
|---|---|
| `src/app/manifest.ts` | Manifeste servi sur `/manifest.webmanifest` : nom, ouverture en `standalone` sur `WebRouterEnum.HOME`, couleurs, icônes de `public/icons/` (dont une `maskable` pour Android) |
| `src/app/apple-icon.png` | Icône de l'écran d'accueil de l'iPhone (180 px) |
| `src/app/layout.tsx` | `appleWebApp` (mode plein écran sur iPhone) et `viewport.themeColor`, clair et sombre |
| `src/app/pwa-theme.ts` | Les couleurs du thème en hexadécimal, copiées des tokens du design system |
| `src/app/sw.ts` | Service worker Serwist, compilé en `public/sw.js` : précache du build ; les pages et leurs charges RSC passent toujours par le réseau (`isPageRequest`, `src/app/sw-page-request.ts`), jamais par un cache, pour qu'aucune donnée du couple ne reste lisible après une déconnexion ou hors ligne ([décision 0036](../../decisions/frontend/0036-lecture-des-donnees-par-la-page-serveur.md)) ; le reste (scripts, styles, images) suit `defaultCache` ; à l'activation, les caches de pages d'une version précédente sont supprimés ; repli vers `WebRouterEnum.OFFLINE` quand une page ne charge pas ; nouvelle version active sans attendre (`skipWaiting`, `clientsClaim`) ; pas de rechargement au retour du réseau (`reloadOnOnline: false`, `next.config.ts`) |
| `src/app/~offline/page.tsx` | Page « Hors ligne », précachée au build |

Le service worker n'existe qu'après `next build --webpack` ([décision plateforme 0014](../../../platform/decisions/0014-socle-technique-de-la-pwa.md)). Les icônes sont provisoires : un « C » blanc sur la couleur principale.

## Le chemin d'un appel

Exemple réel : la connexion, dans `apps/couple/web/src/modules/authentication/` ([décision 0035](../../decisions/frontend/0035-formulaires-de-la-pwa.md)).

1. La vue (`ui/views/sign-in-form.view.tsx`) reçoit le formulaire react-hook-form de `hooks/use-sign-in-form.ts`, qui valide par `createSignInFormSchema(t)` : une erreur s'affiche sous son champ (`Field`, `FieldError`).
2. Le container (`ui/containers/sign-in.container.tsx`) branche `hooks/use-sign-in.ts` sur la gateway du module (`gateways/index.ts`). Le hook reçoit la gateway et ses callbacks en paramètres, jamais l'action (règle 21 de `_knowledge/core-frontend.md`).
3. La gateway `ServerActionAuthenticationCommandGateway` appelle la server action ; le navigateur ne parle jamais directement à l'API. Un appel qui rejette (téléphone hors ligne, page ouverte avant un déploiement) devient une `ApiError` `NETWORK_ERROR`.
4. La server action (`actions/authentication-sign-in.action.ts`) délègue à `services/sign-in-session.service.ts` : il revalide l'entrée par le même schéma, appelle `SignInUseCase` de `couple-client-business-logic`, construit par `createAuthenticationModule(API_URL, API_TIMEOUT_MS)` (`actions/authentication-module.factory.ts`), avec l'adresse IP et le User-Agent du navigateur (`services/sign-in-client-context.service.ts`).
5. Le use case appelle son port ; la gateway `ApiAuthenticationGateway` de `couple-client-infrastructure` vérifie la requête par le schéma du contrat, l'envoie par `httpRequest`, puis vérifie la réponse par `parseResponse`. Seule la connexion ajoute `x-forwarded-for` et `user-agent` : sinon l'API ne verrait que le serveur Next.
6. Tout revient en `Result` : aucune couche ne lève d'exception. Après un succès, le container navigue vers `WebRouterEnum.HOME`.

## Le chemin d'une lecture

Exemple réel : la mise en couple, dans `apps/couple/web/src/modules/pairing/` ([décision 0036](../../decisions/frontend/0036-lecture-des-donnees-par-la-page-serveur.md)).

1. La page `src/app/pairing/page.tsx` (rendue à chaque requête, `dynamic = 'force-dynamic'`) appelle `loadMyCouple()`, qui exécute `GetMyCoupleUseCase` du module construit par `pairingModule()`.
2. La fabrique reçoit `getSessionToken` (`src/shared/application/session/`) sans l'appeler. `ApiPairingGateway` le lit à l'appel et renvoie la session à l'API dans l'en-tête `Cookie`.
3. Le presenter `presentPairingPage` décide : `UNAUTHORIZED` renvoie vers `WebRouterEnum.ACCOUNT_SIGN_IN`, un couple formé vers `WebRouterEnum.HOME`, sinon l'écran « sans couple », « code d'invitation » ou « indisponible ». L'accueil suit `resolveHomeDestination`.
4. Une action (créer le couple, saisir le code de l'autre, nouveau code, annuler le couple) passe par une server action qui rend `Result<null, ApiError>`, puis le container appelle `router.refresh()` : la page relit le couple. Une seule action tourne à la fois. Un refus `UNAUTHORIZED` renvoie vers la connexion, un `CONFLICT` ou un `NOT_FOUND` relit l'écran. L'écran se relit aussi quand la PWA revient au premier plan et sur « Actualiser ». Pendant la lecture, `src/app/pairing/loading.tsx` montre des `Skeleton`.

## La session dans la PWA

| Élément | Rôle |
|---|---|
| Cookie `SESSION_COOKIE_NAME` | Posé par la server action après la connexion : `HttpOnly`, `Secure` en production, `SameSite=Lax`, `path=/`, expiré à `sessionExpiresAt` ([décision 0034](../../decisions/0034-session-revocable.md)). Le jeton n'apparaît ni dans la réponse de l'action ni dans le code client |
| `src/proxy.ts` | Renvoie vers `WebRouterEnum.ACCOUNT_SIGN_IN` toute page demandée sans cookie, sauf l'écran de connexion et `WebRouterEnum.OFFLINE`. Le `matcher` exclut les fichiers de la PWA, demandés sans cookie (manifeste, icônes, service worker). Il ne vérifie que la présence du cookie : le garde de session de l'API vérifie le jeton à chaque appel |
| `src/env/server.ts` | `API_URL` et `API_TIMEOUT_MS`, validés au démarrage du serveur par `src/instrumentation.ts`, jamais exposés au navigateur (`server-only`) |

Une page qui reçoit `UNAUTHORIZED` renvoie vers la connexion. « Se déconnecter » (`SignOutContainer`, sur l'accueil et `/pairing`) appelle `DELETE /authentication/session` avec la session : l'API ferme les sessions de tous les appareils, puis l'action retire le cookie de ce navigateur. La fabrique `createAuthenticationModule` reçoit donc elle aussi `getSessionToken`, que seule la déconnexion lit ; la connexion n'en a pas besoin.

## Les erreurs

`httpRequest` ne lève jamais. Un échec devient une `ApiError` `{ code, message, backendCode }` :

| Cas | `code` |
|---|---|
| Réseau coupé, délai dépassé | `NETWORK_ERROR` |
| Réponse de succès illisible ou hors contrat | `INVALID_RESPONSE` |
| 400 ou 422 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| Autre statut | `UNKNOWN` |

`backendCode` reprend le `code` du corps d'erreur de l'API (par exemple `PAIRING_INVITATION_CODE_INVALID`), ou `null`. Le container l'affiche en toast : un titre traduit propre à l'action, et en description `describeApiResultError(error, t)` (`apps/couple/web/src/shared/application/api-result/`), qui traduit `apiErrors.<backendCode>`, sinon `apiErrors.<code>`, sinon garde le message de l'API ([décision 0010](../../decisions/frontend/0010-affichage-erreur-serveur.md)). Les clés vivent dans le fichier de langue de l'écran (`src/i18n/locales/fr/authentication/sign-in.json`).

## Voir aussi

- [Statut HTTP des exceptions](../../decisions/0020-statut-http-des-exceptions.md), côté serveur
- [Schémas de formulaire construits avec la traduction](../../decisions/frontend/0031-messages-zod-traduits.md)
- [Formulaires par react-hook-form, server action qui rend un résultat](../../decisions/frontend/0035-formulaires-de-la-pwa.md)
- [Essayer la PWA sur le téléphone](../../../guides/local-setup.md)
