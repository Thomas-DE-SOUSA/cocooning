# Écarts : frontend

Écarts constatés dans la PWA `apps/couple/web` qui ne relèvent d'aucun contexte. On ajoute en fin de fichier ; une entrée traitée garde sa trace avec son nouveau statut.

### 001. Les contrôles ESLint des décisions 0009, 0010 et 0011 n'existent pas

- Type : règle validée non construite
- Constaté le : 2026-11-23, premier module de la PWA (branche `feat/authentication-web`)
- Où : `config/eslint-config/next.js`, `config/eslint-config/boundaries.js`, `apps/couple/web/eslint.config.mjs`
- Constat : rien n'empêche une vue d'appeler un autre hook que `useTranslation` et `useForm` ni d'importer une action ou une gateway ([décision 0009](../decisions/frontend/0009-use-translation-dans-les-vues.md)), un `toast.error` de lire `.message` d'une erreur ([décision 0010](../decisions/frontend/0010-affichage-erreur-serveur.md)), ni un module d'importer l'intérieur d'un autre ou une route d'importer autre chose que le point d'entrée d'un module ([décision 0011](../decisions/frontend/0011-pwa-rangee-par-fonctionnalite.md)). Le module `authentication` les respecte, vérifié en revue seulement. Le test des clés `apiErrors.<code>` ne couvre que les codes que la connexion peut recevoir (`src/modules/authentication/data/authentication-i18n-namespaces.spec.ts`), pas tous ceux du contrat.
- Règle concernée : décisions 0009, 0010 et 0011 (contrôles annoncés en phase 3)
- Statut : ouvert
