# Commandes d'exploitation de l'API

Points d'entree lances par le proprietaire sur la VM, jamais par une route (decision plateforme 0016). Une commande par dossier : `<commande>/main.ts`, compile en `dist/commands/<commande>/main.js`, lance dans l'image `runner` par `docker compose ... run --rm --no-deps api node dist/commands/<commande>/main.js`.

- `command-terminal.ts` : `CommandTerminal`, partage par toutes les commandes.
- `create-account/` : cree un compte (R6). `main.ts` (`Uuid.configure`, `process.exitCode`), `runCreateAccountCommand(args, terminal)` (`create-account-command.ts`), `CreateAccountCommandModule` (seul fournisseur de `CreateAccountUseCase`, par `authenticationUseCase()`), `MaskedPrompt` (lecture sans echo), `readPassword` (deux saisies), `reportCreateAccountFailure`, `CreateAccountExitCodeEnum` (`0`, `64`, `65`, `1`).
- `record-together-periods/` : enregistre les periodes ensemble du couple (R9, decision 0045). `runRecordTogetherPeriodsCommand(args, terminal)` (adresse puis periodes `<debut>..<fin>` ou `<debut>..`, lues par `parseTogetherPeriods` qui ne juge que la forme), `RecordTogetherPeriodsCommandModule` (seul fournisseur de `RecordTogetherPeriodsUseCase`, par `pairingUseCase()`, sur `AuthenticationSecondaryModule` et `PairingSecondaryModule`), compte trouve par `AccountRepository.findByEmailAddress`, `reportRecordTogetherPeriodsFailure`, `RecordTogetherPeriodsExitCodeEnum` (`0`, `64`, `65`, `67` compte inconnu, `1`). Aucun jour n'est affiche, ni en succes ni en refus.

## Consignes de code

- Le module d'une commande importe `ConfigModule` (`validateEnvironment`), `LoggerModule`, `PrismaModule` et les modules secondaires de `src/modules/<contexte>/`, jamais `AppModule` : aucune route ne doit atteindre son use case. Le use case se construit par la fabrique du contexte, jamais recopiee.
- `main.ts` ne fait que `Uuid.configure(new UuidV7GeneratorProvider())`, appeler la fonction de la commande et poser `process.exitCode`. La logique va dans une fonction qui recoit `args` et un `CommandTerminal` (`input`, `output`, `errorOutput`), pour que l'E2E la lance sans processus.
- Contexte Nest par `NestFactory.createApplicationContext(Module, { logger: false })`, ferme dans un `finally` (Prisma se deconnecte).
- Un secret se lit par `MaskedPrompt` sur l'entree standard, jamais en argument (historique du shell). Ni le secret ni son hachage dans une sortie, un log ou une erreur (`core.md` regles 30 et 33) : une erreur inattendue n'affiche que le nom de sa classe.
- Codes de sortie en enum `as const` (numeros de `sysexits.h`) : `64` erreur de saisie, `65` refus du domaine (`Refused: <code> (<message>)`, sans pile), `67` compte inconnu, `1` panne.

## Tests

- E2E `test/commands/<commande>.e2e-spec.ts` (reussite, secrets) et `<commande>-refusals.e2e-spec.ts` (refus, saisie), contre le Postgres de test : `runCreateAccount(args, typedLines)` (`test/commands/create-account-test-data.ts`) donne a la commande une entree `PassThrough` (chaque ligne finie par `\r`) et capture ses sorties par `CapturedOutput` (`test/commands/captured-output.ts`, avec `refused(code, message)`) ; `AuthenticationTestApp` prouve que le compte se connecte. `runRecordTogetherPeriods(args)` (`record-together-periods-test-data.ts`) fait de meme sur un couple forme par `PairingTestApp`, qui relit les periodes par `GET`.
- Un cas reussi, chaque refus du domaine, chaque erreur de saisie, et l'absence du mot de passe et de `$argon2` dans les sorties.
- `pnpm --filter couple-api test:e2e`

## Documentation a tenir a jour

- Tout changement : relire chaque page qui cite le fichier ou la classe modifies, trouvee avec `rg -l '<NomDeClasse>|<chemin/du/fichier>' docs/ _knowledge/`.
- Usage, codes de sortie, verification : `docs/couple/infrastructure/runbooks/<contexte>/` (`authentication/accounts.md`, `pairing/together-periods.md`).
- Composants de la commande : `docs/couple/architecture/<contexte>/index.md`.
- Nouvelle commande : la liste ci-dessus et la carte du `CLAUDE.md` racine.

## Pieges

- Deux `readline` successifs sur la meme entree perdent les lignes deja lues par le premier : une seule `MaskedPrompt` pour toutes les questions.
- `readline` en mode terminal ecrit l'echo dans sa sortie : `MaskedPrompt` lui donne une sortie qui jette tout, la question va sur la vraie sortie.
- `docker compose run` alloue un TTY par defaut ; sans TTY (`-T`), la saisie n'est pas masquee par le terminal mais reste hors de l'historique.
- La commande valide tout l'environnement de l'API : elle tourne dans le service `api`, qui l'a en entier.
