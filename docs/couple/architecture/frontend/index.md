# Front de la PWA

Comment la PWA `apps/couple/web` parle à l'API, et ce que porte chaque package front. Les règles de code front sont dans `_knowledge/core-frontend.md`.

## Les packages

| Package | Rôle | Peut importer |
|---|---|---|
| `@cocooning/couple-client-business-logic` | Logique métier front sans framework : ports des gateways, use cases, schémas de formulaire, presenters. Aujourd'hui : `ApiError` et `Translator` (`shared`), et pour `authentication` le formulaire de connexion (`createSignInFormSchema`), le port `AuthenticationGateway` et `SignInUseCase` | `shared-kernel`, `couple-shared-kernel`, `couple-contract`, zod |
| `@cocooning/client-infrastructure` | Le seul `fetch` des gateways (`httpRequest`), la vérification d'une réponse par son contrat (`parseResponse`), `resolveRoute`, et le faux `fetch` des specs (`FakeFetch`, sous-chemin `testing`) | `shared-kernel`, zod |
| `@cocooning/couple-client-infrastructure` | Les gateways du couple, leur configuration HTTP commune (`createCoupleHttpConfig`) et la fabrique de chaque contexte. Aujourd'hui : `ApiAuthenticationGateway` et `createAuthenticationModule` (`authentication`) | les trois précédents, `couple-contract` |
| `@cocooning/design-system` | Composants d'interface sans domaine et couleurs du thème (clair et sombre selon le téléphone). Aujourd'hui : `Button`, `Field` et `FieldError`, `Input`, `Label`, `Skeleton`, `Spinner`, `Toaster` | React, Tailwind |
| `apps/couple/web` | Pages, server actions, containers et vues. Aujourd'hui : layout racine, accueil provisoire, pages d'erreur, traduction en français (`src/i18n/`), manifeste, service worker et page hors ligne | tout ce qui précède |

ESLint (`config/eslint-config/boundaries.js`) refuse les imports qui sortent de cette table : `client-business-logic` n'importe ni React, ni Next, ni un adaptateur.

## L'installation sur le téléphone

La PWA s'installe sur l'écran d'accueil ([décision plateforme 0007](../../../platform/decisions/0007-pwa-sans-application-native.md)) :

| Fichier de `apps/couple/web` | Rôle |
|---|---|
| `src/app/manifest.ts` | Manifeste servi sur `/manifest.webmanifest` : nom, ouverture en `standalone` sur `WebRouterEnum.HOME`, couleurs, icônes de `public/icons/` (dont une `maskable` pour Android) |
| `src/app/apple-icon.png` | Icône de l'écran d'accueil de l'iPhone (180 px) |
| `src/app/layout.tsx` | `appleWebApp` (mode plein écran sur iPhone) et `viewport.themeColor`, clair et sombre |
| `src/app/pwa-theme.ts` | Les couleurs du thème en hexadécimal, copiées des tokens du design system |
| `src/app/sw.ts` | Service worker Serwist, compilé en `public/sw.js` : précache du build, cache des requêtes par `defaultCache`, repli vers `WebRouterEnum.OFFLINE` quand une page ne charge pas, nouvelle version active sans attendre (`skipWaiting`, `clientsClaim`) |
| `src/app/~offline/page.tsx` | Page « Hors ligne », précachée au build |

Le service worker n'existe qu'après `next build --webpack` ([décision plateforme 0014](../../../platform/decisions/0014-socle-technique-de-la-pwa.md)). Les icônes sont provisoires : un « C » blanc sur la couleur principale.

## Le chemin d'un appel (à partir du premier écran)

1. La vue déclenche une server action ; le navigateur ne parle jamais directement à l'API.
2. La server action appelle un use case de `couple-client-business-logic`, construit par la fabrique du contexte (`createAuthenticationModule(apiBaseUrl, timeoutMs)`), qui garde la gateway pour elle.
3. Le use case appelle son port ; la gateway de `couple-client-infrastructure` l'implémente.
4. La gateway vérifie la requête par le schéma de requête du contrat, l'envoie par `httpRequest`, puis vérifie la réponse par `parseResponse` et le schéma de réponse. Seule la connexion ajoute l'adresse IP et le User-Agent du navigateur (`x-forwarded-for`, `user-agent`) : sinon l'API ne verrait que le serveur Next.
5. Tout revient en `Result` : aucune couche ne lève d'exception.

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

`backendCode` reprend le `code` du corps d'erreur de l'API (par exemple `PAIRING_INVITATION_CODE_INVALID`), ou `null`. L'écran choisit son message traduit par ce code ([décision 0010](../../decisions/frontend/0010-affichage-erreur-serveur.md)).

## Voir aussi

- [Statut HTTP des exceptions](../../decisions/0020-statut-http-des-exceptions.md), côté serveur
- [Schémas de formulaire construits avec la traduction](../../decisions/frontend/0031-messages-zod-traduits.md)
- [Essayer la PWA sur le téléphone](../../../guides/local-setup.md)
