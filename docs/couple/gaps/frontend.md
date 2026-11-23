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
