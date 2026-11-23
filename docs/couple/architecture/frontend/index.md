# Front de la PWA

Comment la PWA `apps/couple/web` parle à l'API, et ce que porte chaque package front. Les règles de code front sont dans `_knowledge/core-frontend.md`.

## Les packages

| Package | Rôle | Peut importer |
|---|---|---|
| `@cocooning/couple-client-business-logic` | Logique métier front sans framework : ports des gateways, use cases, schémas de formulaire, presenters. Aujourd'hui : `ApiError` et `Translator` (`shared`) | `shared-kernel`, `couple-shared-kernel`, `couple-contract`, zod |
| `@cocooning/client-infrastructure` | Le seul `fetch` des gateways (`httpRequest`), la vérification d'une réponse par son contrat (`parseResponse`), `resolveRoute` | `shared-kernel`, zod |
| `@cocooning/couple-client-infrastructure` | Les gateways du couple et leur configuration HTTP commune (`createCoupleHttpConfig`) | les trois précédents, `couple-contract` |
| `@cocooning/design-system` | Composants d'interface sans domaine et couleurs du thème (clair et sombre selon le téléphone). Aujourd'hui : `Button`, `Skeleton`, `Toaster` | React, Tailwind |
| `apps/couple/web` | Pages, server actions, containers et vues. Aujourd'hui : layout racine, accueil provisoire, pages d'erreur, traduction en français (`src/i18n/`) | tout ce qui précède |

ESLint (`config/eslint-config/boundaries.js`) refuse les imports qui sortent de cette table : `client-business-logic` n'importe ni React, ni Next, ni un adaptateur.

## Le chemin d'un appel (à partir du premier écran)

1. La vue déclenche une server action ; le navigateur ne parle jamais directement à l'API.
2. La server action appelle un use case de `couple-client-business-logic`, construit par la fabrique du module.
3. Le use case appelle son port ; la gateway de `couple-client-infrastructure` l'implémente.
4. La gateway envoie la requête par `httpRequest`, puis vérifie la réponse par `parseResponse` et le schéma du contrat.
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
