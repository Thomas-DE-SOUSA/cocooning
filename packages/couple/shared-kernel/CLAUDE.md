# @cocooning/couple-shared-kernel

Ce que le serveur et la PWA du couple partagent sans passer par HTTP. Sous-chemins :

- `enums` : enums metier `as const`, un fichier par enum (decision 0002) : `CouplePairingStatusEnum` (`PENDING`, `PAIRED`), lu par `pairing` et par la reponse HTTP de la PWA.
- `routers` : `ApiRouterEnum` et `WebRouterEnum`, avec `API_ROUTE_GROUPS` et `WEB_ROUTE_GROUPS` (la liste des fichiers de routes, lue par la spec anti-collision) et le type `RouteGroup`. API : `HealthRouteEnum` (`HEALTH_CHECK`, route publique de sante de l'API), `PairingRouteEnum` (`COUPLE_CREATE` et `COUPLE_GET_MINE` sur `/pairing/couple`, distingues par le verbe, `COUPLE_JOIN`, `COUPLE_INVITATION_CODE_RENEW`). Web : `HomeRouteEnum` (`HOME`, `/`), `OfflineRouteEnum` (`OFFLINE`, `/~offline`, page de repli du service worker).
- `limits` : bornes qui sont a la fois un invariant du domaine et une borne du contrat ou d'un formulaire : `EMAIL_ADDRESS_MAX_LENGTH`, `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH` (decision 0032).
- `exceptions` : `MissingExecutionContextException` (code `EXECUTION_CONTEXT_MISSING`), levee par le `ensureRequiredContextPresent` des guard services.

## A lire avant de commencer

Contenu des deux shared kernels et regles d'ajout :
@../../../_knowledge/backend/shared-kernel.md

## Consignes de code

- Une seule dependance runtime : `@cocooning/shared-kernel`. Aucun framework, aucune API Node : le package est importe par l'API et par la PWA.
- Exports par sous-chemin uniquement (`enums`, `routers`, `exceptions`, `limits`), pas d'export racine. `types` pointe vers `src`, `default` vers `dist`.
- Aucune logique metier : enums, routes, bornes et exceptions transverses seulement. Un enum utilise par un seul contexte reste dans son `domain/enums/`.
- Ajouter les routes d'un contexte : creer `src/routers/<api|web>/<contexte>.route.ts` (`export const NoteRouteEnum = { NOTE_LIST: '/notes' } as const satisfies RouteGroup;`, cles prefixees par l'agregat), puis l'ajouter a la fois dans `API_ROUTE_GROUPS` et par spread dans `ApiRouterEnum` (idem pour le web).
- Pas de modele de permissions ni de dossier `authorization/` (decision 0026).
- Modeles a copier : `src/exceptions/missing-execution-context.exception.ts` (exception), `src/routers/api/api-router.enum.ts` (routeur).

## Tests

- Une spec `*.spec.ts` a cote du fichier, style BDD (`Feature:`, `Scenario:`), sans `should`.
- `src/routers/routers.spec.ts` echoue si deux groupes declarent la meme cle, ou si un groupe est ajoute au routeur sans etre liste dans `*_ROUTE_GROUPS` (ou l'inverse).

## Pieges

- Un spread ecrase en silence une cle deja presente : c'est le bug de `WebRouterEnum.ExitDetail` chez Malta. Ne jamais retirer un groupe de `*_ROUTE_GROUPS`, la spec ne verrait plus ses collisions.
- `EXECUTION_CONTEXT_MISSING` n'a pas encore de statut HTTP : la table code -> statut de l'API (decision 0020) doit l'inclure quand elle sera creee.
- Jest resout `@cocooning/shared-kernel` vers ses `src` (`moduleNameMapper`) ; le build lit son `dist`, construit avant par turbo.

## Commandes

- `pnpm --filter @cocooning/couple-shared-kernel test`
- `pnpm --filter @cocooning/couple-shared-kernel check-types`
- `pnpm --filter @cocooning/couple-shared-kernel lint`
- `pnpm --filter @cocooning/couple-shared-kernel build`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/ CLAUDE.md`.
- Enum, routeur ou exception ajoute, retire ou renomme : la section « Couple shared kernel » de `_knowledge/backend/shared-kernel.md`.
- Route renommee ou deplacee : les pages qui citent sa cle (`rg -l '<CLE_DE_ROUTE>' docs`) et la regle 18 de `_knowledge/core-frontend.md`.
- Termes `Shared kernel` et `Router enum` : `docs/architecture/glossary.md`.
