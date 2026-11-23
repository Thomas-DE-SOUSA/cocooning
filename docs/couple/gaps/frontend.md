# Écarts : frontend

Écarts constatés dans la PWA `apps/couple/web` qui ne relèvent d'aucun contexte. On ajoute en fin de fichier ; une entrée traitée garde sa trace avec son nouveau statut.

### 001. Les contrôles ESLint des décisions 0009, 0010 et 0011 n'existent pas

- Type : règle validée non construite
- Constaté le : 2026-11-23, premier module de la PWA (branche `feat/authentication-web`)
- Où : `config/eslint-config/next.js`, `config/eslint-config/boundaries.js`, `apps/couple/web/eslint.config.mjs`
- Constat : rien n'empêche une vue d'appeler un autre hook que `useTranslation` et `useForm` ni d'importer une action ou une gateway ([décision 0009](../decisions/frontend/0009-use-translation-dans-les-vues.md)), un `toast.error` de lire `.message` d'une erreur ([décision 0010](../decisions/frontend/0010-affichage-erreur-serveur.md)), ni un module d'importer l'intérieur d'un autre ou une route d'importer autre chose que le point d'entrée d'un module ([décision 0011](../decisions/frontend/0011-pwa-rangee-par-fonctionnalite.md)). Le module `authentication` les respecte, vérifié en revue seulement. Le test des clés `apiErrors.<code>` ne couvre que les codes que la connexion peut recevoir (`src/modules/authentication/data/authentication-i18n-namespaces.spec.ts`), pas tous ceux du contrat.
- Règle concernée : décisions 0009, 0010 et 0011 (contrôles annoncés en phase 3)
- Statut : corrigé le 2026-11-23 (branche `chore/frontend-lint-guardrails`) : `config/eslint-config/feature-modules.js`, étalé par `next.js`, fait échouer `pnpm lint` (fixtures de `__fixtures__/next-code/src/modules/`). Pour la décision 0011, la frontière passe par `no-restricted-imports` (alias `@/modules/<module>/...` et chemin relatif qui remonte au-dessus du dossier du module) plutôt que par `eslint-plugin-boundaries`, qui ne résout pas l'alias `@/` sans résolveur. Le test des clés `apiErrors.<code>` est suivi à part (002). Complété le 2026-11-23 (branche `chore/lint-feature-module-holes`, revue des étapes 2 et 3) : le premier contrôle laissait passer un chemin relatif vers l'intérieur d'un module depuis `src/app/`, un import de `@/modules` depuis `src/shared/`, `use(...)` ou un import de `services/` et `hooks/` dans une vue, un hook qui importe une server action (`core-frontend.md` règle 21) et un `toast.error` qui lit `.message` hors de `src/modules/` ; chacun a maintenant sa fixture `forbidden-*` dans `__fixtures__/next-code/src/`.

### 002. Le test des clés `apiErrors.<code>` ne couvre que l'écran de connexion

- Type : décision à trancher
- Constaté le : 2026-11-23, garde-fous ESLint (branche `chore/frontend-lint-guardrails`)
- Où : `apps/couple/web/src/modules/authentication/data/authentication-i18n-namespaces.spec.ts`
- Constat : la décision 0010 annonce un test qui vérifie que chaque code d'exception du contrat `@cocooning/couple-contract` a sa clé `apiErrors.<code>` « dans chaque fichier de langue ». Le seul test existant vérifie les codes que la connexion peut recevoir, dans le namespace de son écran. Exiger tous les codes du contrat dans chaque namespace d'écran ferait traduire des refus qu'un écran ne reçoit jamais ; la portée reste à fixer avant le deuxième écran.
- Règle concernée : [décision 0010](../decisions/frontend/0010-affichage-erreur-serveur.md)
- Statut : clos, tranché par la [décision 0037](../decisions/frontend/0037-traductions-des-erreurs-par-ecran.md)

### 003. Les routes, les containers et le hook de composition de l'écran ne sont rendus par aucun test

- Type : test manquant
- Constaté le : 2026-11-23, revue des étapes 2 et 3
- Où : `apps/couple/web/src/app/page.tsx`, `apps/couple/web/src/app/pairing/page.tsx`, `apps/couple/web/src/modules/*/ui/containers/`, `apps/couple/web/src/modules/pairing/hooks/use-pairing-screen.ts`
- Constat : une route qui monte un container importe la server action et `serverEnv`, que t3-env refuse sous jsdom ; `use-pairing-screen` appelle `useRouter` de `next/navigation`, sans routeur dans un test. Les décisions qu'ils portent sont sorties dans des fonctions testées (`presentPairingPage`, `resolveHomeDestination`, `resolveCommandFailureFollowUp`, `closeSignOutSession`, `isSecureCookie`), mais le câblage lui-même (choix de la vue, clés des toasts, redirection) n'est vérifié qu'à la main.
- Règle concernée : `core-backend.md` règle 20 pour l'esprit (E2E des points d'entrée) ; aucune règle front écrite
- Statut : ouvert

### 004. La fabrique `authentication` reçoit un fournisseur de session, contrairement à ce que dit la décision 0036

- Type : écart avec une règle validée
- Constaté le : 2026-11-23, revue des étapes 2 et 3
- Où : `apps/couple/web/src/modules/authentication/services/authentication-module.factory.ts`, `docs/couple/decisions/frontend/0036-lecture-des-donnees-par-la-page-serveur.md` (Conséquences)
- Constat : la décision 0036 dit que la fabrique `authentication`, dont le premier appel est public, ne prend pas de `getSessionToken`. Depuis la déconnexion (décision 0034), `SignOutUseCase` agit pour le partenaire connecté : la fabrique reçoit donc `getSessionToken`, que seule la déconnexion lit. Une fabrique de contexte reçoit `getSessionToken` dès qu'un de ses use cases agit pour le partenaire connecté. Retirer le fournisseur pour suivre la décision casserait la déconnexion : sans session, l'API répond 401, que `SignOutUseCase` compte comme une session fermée, et seuls les autres appareils resteraient connectés.
- Règle concernée : [décision 0036](../decisions/frontend/0036-lecture-des-donnees-par-la-page-serveur.md)
- Statut : ouvert, une décision qui remplace ce point de 0036 est à proposer au propriétaire
