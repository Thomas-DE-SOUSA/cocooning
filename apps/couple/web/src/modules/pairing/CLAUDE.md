# Pairing

Le partenaire connecte cree le couple et transmet le code d'invitation, ou saisit le code de l'autre pour rejoindre le couple, ou annule son couple en attente (R8) ; sans couple forme, l'accueil le renvoie ici.

## A lire avant de commencer

Glossaire :
@../../../../../../docs/couple/business-rules/pairing/glossary.md

Regles metier :
@../../../../../../docs/couple/business-rules/pairing/rules.md

Architecture front (chemin d'une lecture, session, erreurs) :
@../../../../../../docs/couple/architecture/frontend/index.md

## Consignes de code

- Lecture par la page serveur (decision 0036) : `loadMyCouple()` (`services/`, `server-only`) puis un presenter pur, `presentPairingPage(couple, now)` pour `/pairing` (l'instant vient de la page, le presenter dit si le code a expire, R4), `resolveHomeDestination` pour `/`. La page fait le `redirect()`, jamais le presenter. Pages en `dynamic = 'force-dynamic'`. Pendant la lecture, `src/app/pairing/loading.tsx` montre des `Skeleton` de la forme de l'ecran.
- `pairingModule()` (`actions/pairing-module.factory.ts`) construit le module a chaque appel avec `getSessionToken`, jamais a l'import : `next build` charge ce fichier sans les variables.
- Les actions rendent `Result<null, ApiError>` ; `router.refresh()` part dans la transition (`hooks/use-pairing-commands.ts` : une commande a la fois, `isBusy` desactive tous les boutons, `pendingCommand` dit lequel tourne, rendu par `ui/components/command-button.tsx`) et la page relit le couple. Le cablage (router, toasts, partage) vit dans le hook de composition `hooks/use-pairing-screen.ts` ; le container ne choisit que la vue. Apres un refus, `resolveCommandFailureFollowUp` (`presenters/`) decide la suite : `UNAUTHORIZED` vers la connexion, `CONFLICT` et `NOT_FOUND` relisent l'ecran.
- Saisie du code (`ui/views/join-couple-form.view.tsx`, `hooks/use-join-couple-form.ts`) : `createJoinCoupleFormSchema(t)` cote client et de nouveau cote serveur (`services/join-couple.service.ts`, `core-frontend.md` regle 14). Clavier en majuscules sans correction, minuscules et espaces acceptes (R3) ; un code faux recoit le seul refus `PAIRING_INVITATION_CODE_INVALID` en toast (R6).
- Date d'expiration formatee dans le presenter par `I18N_CONFIG.timeZone` (`Europe/Paris`) : le serveur (UTC) et le telephone affichent la meme heure, sans ecart d'hydratation.
- Partage du code : feuille de partage du telephone (`navigator.share`), sinon presse-papiers ; une feuille fermee par le partenaire n'est pas une erreur.
- Codes que l'ecran peut recevoir : `PAIRING_SCREEN_ERROR_CODES` (`data/`), chacun avec sa cle `apiErrors.<code>` (decision 0037).

## Tests

- `FakePairingCommandGateway` (`gateways/fake/`) pour `usePairingCommands` ; `holdAnswers()` retient les reponses jusqu'a l'appel du `release` rendu, pour voir une commande en cours ; `A_PENDING_COUPLE` et `A_PAIRED_COUPLE` de `@cocooning/couple-client-business-logic/testing` pour les presenters.
- `navigator.share`, `navigator.clipboard` et `document.visibilityState` se posent par `Object.defineProperty` dans la spec du hook, jamais par `jest.mock`.
