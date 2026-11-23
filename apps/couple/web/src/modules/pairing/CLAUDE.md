# Pairing

Le partenaire connecte cree le couple et transmet le code d'invitation, ou saisit le code de l'autre pour rejoindre le couple ; sans couple forme, l'accueil le renvoie ici.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/pairing/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/pairing/rules.md

Architecture front (chemin d'une lecture, session, erreurs) :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Lecture par la page serveur (decision 0036) : `loadMyCouple()` (`services/`, `server-only`) puis un presenter pur, `presentPairingPage` pour `/pairing`, `resolveHomeDestination` pour `/`. La page fait le `redirect()`, jamais le presenter. Pages en `dynamic = 'force-dynamic'`.
- `pairingModule()` (`actions/pairing-module.factory.ts`) construit le module a chaque appel avec `getSessionToken`, jamais a l'import : `next build` charge ce fichier sans les variables.
- Les actions rendent `Result<null, ApiError>` ; `router.refresh()` part dans la transition (`hooks/use-pairing-commands.ts`, `pendingCommand` dit quel bouton tourne) et la page relit le couple. Le cablage (router, toasts, partage) vit dans le hook de composition `hooks/use-pairing-screen.ts` ; le container ne choisit que la vue.
- Saisie du code (`ui/views/join-couple-form.view.tsx`, `hooks/use-join-couple-form.ts`) : `createJoinCoupleFormSchema(t)` cote client et de nouveau cote serveur (`services/join-couple.service.ts`, `core-frontend.md` regle 14). Clavier en majuscules sans correction, minuscules et espaces acceptes (R3) ; un code faux recoit le seul refus `PAIRING_INVITATION_CODE_INVALID` en toast (R6).
- Date d'expiration formatee dans le presenter par `I18N_CONFIG.timeZone` (`Europe/Paris`) : le serveur (UTC) et le telephone affichent la meme heure, sans ecart d'hydratation.
- Partage du code : feuille de partage du telephone (`navigator.share`), sinon presse-papiers ; une feuille fermee par le partenaire n'est pas une erreur.
- Codes que l'ecran peut recevoir : `PAIRING_SCREEN_ERROR_CODES` (`data/`), chacun avec sa cle `apiErrors.<code>` (decision 0037).

## Tests

- `FakePairingCommandGateway` (`gateways/fake/`) pour `usePairingCommands` ; `A_PENDING_COUPLE` et `A_PAIRED_COUPLE` de `@cocooning/couple-client-business-logic/testing` pour les presenters.
- `navigator.share`, `navigator.clipboard` et `document.visibilityState` se posent par `Object.defineProperty` dans la spec du hook, jamais par `jest.mock`.
