# Glossaire

Les termes métier partagés par tous les contextes et le vocabulaire d'architecture du dépôt, chacun avec son nom dans le code. À lire pour nommer correctement ce qu'on ajoute : un terme absent d'ici ou du glossaire d'un contexte s'ajoute d'abord ici (règle « Ubiquitous language » du `CLAUDE.md` racine).

## Termes métier

Le couple parle français, le code est en anglais. Aucune réglementation ne fixe ce vocabulaire (D30 ouverte) : ce glossaire est la liste des termes autorisés. Les noms de code sont une première proposition, confirmée quand le contexte est codé ; chaque contexte aura son propre `glossary.md` dans `docs/couple/business-rules/<contexte>/`.

| Terme | Nom dans le code | Définition |
|---|---|---|
| **Couple** | `Couple`, `coupleId` | Les deux partenaires qui partagent l'application. Toute donnée lui appartient |
| **Partenaire** | `Partner`, `userId` | L'une des deux personnes du couple, titulaire d'un compte |
| **Compte** | `Account`, `AccountId` | Les identifiants de connexion d'un partenaire : adresse e-mail, mot de passe haché, version de session. Son identifiant est le `userId` du partenaire |
| **Adresse e-mail** | `EmailAddress` | L'identifiant de connexion d'un compte. Aucun e-mail n'est envoyé |
| **Connexion / déconnexion** | `SignIn` / `SignOut` | Ouvrir une session avec son adresse et son mot de passe ; fermer toutes ses sessions |
| **Session** | `sessionToken`, `sessionVersion` | Le jeton signé posé en cookie après la connexion, valable 90 jours. La version de session du compte change à chaque déconnexion |
| **Mise en couple** | contexte `pairing` | Le lien entre deux comptes : l'un crée le couple, l'autre le rejoint par un code |
| **Code d'invitation** | `InvitationCode` | Le code à 8 signes qu'un partenaire donne à l'autre pour qu'il rejoigne le couple |
| **Couple en attente / formé** | `CouplePairingStatus` `PENDING` / `PAIRED` | En attente : un seul membre, un code valable. Formé : les deux partenaires |
| **Propriétaire** | `ownerId` | Le partenaire qui a créé une donnée |
| **Note** | `Note` | Texte riche, perso ou partagé, éditable à deux en temps réel |
| **Note perso / partagée** | `NoteVisibility` `PRIVATE` / `SHARED` | Une note perso n'est visible que de son propriétaire ; une note partagée est visible et modifiable par les deux |
| **Liste de courses** | `Note` | Une note ordinaire titrée « Courses ». Pas de concept propre dans le code |
| **Agenda** | contexte `agenda` | Le calendrier partagé du couple |
| **Événement d'agenda** | `CalendarEvent` | Un rendez-vous du calendrier, partagé ou rien que pour son auteur, avec son auteur visible. Nommé ainsi pour ne pas le confondre avec un événement de domaine (`*.event.ts`) |
| **Message flash** | `FlashMessage` | Un mot court envoyé à l'autre (« je t'aime »), notifié par Web Push |
| **Photo instantanée** | `InstantPhoto` | Une photo prise dans l'app et envoyée directement à l'autre |
| **Invitation photo** | `PhotoPrompt` | La demande, à une heure tirée au hasard, de prendre une photo instantanée |
| **Notification** | `PushNotification` | Le message discret, sans contenu, qu'un téléphone reçoit quand l'autre envoie un mot ou une photo, ajoute un événement ou partage une note (contexte `messaging`) |

## Vocabulaire d'architecture

| Terme | Définition dans ce dépôt |
|---|---|
| **Bounded context** | Périmètre métier autonome avec son modèle et son vocabulaire. Un dossier `packages/couple/server-business-logic/src/<contexte>/`, repris à l'identique dans `docs/`, l'API et le client |
| **Domaine (couche)** | `domain/` : `models`, `value-objects`, `enums`, `events`, `exceptions`, `ports`, `services`. TypeScript pur plus le shared kernel |
| **Application (couche)** | `application/` : `use-cases`, `services` (guard et applicatifs), `mappers` |
| **Infrastructure, adaptateurs** | Implémentations des ports (Prisma, HTTP, Web Push), dans `apps/couple/api/src/modules/<contexte>/secondary/` et les packages d'infrastructure |
| **Primary, secondary** | Adaptateurs entrants (`primary/{controllers,dto,mappers}`) et sortants (`secondary/{repositories,providers,handlers}`) |
| **Agrégat** | Racine de cohérence. Constructeur privé, une factory par variante nommée par un verbe métier, invariants vérifiés dans ses méthodes, `toSnapshot()` et `fromSnapshot()` |
| **Invariant** | Règle toujours vraie pour un agrégat, numérotée `INV-NNN` dans son `aggregate.md` |
| **Value object** | Donnée immuable et validée, égalité par valeur ; `create()` valide, `from()` hydrate sans revalider |
| **Identifiant typé** | Value object d'identité (`NoteId`) qui empêche de passer un `coupleId` à la place d'un `noteId` |
| **Événement de domaine** | Fait passé immuable, nom littéral `EVENT_NAME` sur sa classe (décision 0004) |
| **Port** | Classe abstraite déclarée dans le domaine, utilisée comme jeton d'injection |
| **Repository** | Port de persistance d'un agrégat, `coupleId` en premier paramètre de chaque méthode |
| **Provider** | Port de lecture seule vers un autre contexte, nommé par la question posée |
| **Domain service** | Logique métier pure, sans état, instanciée en ligne (décision 0005) |
| **Guard service** | Service applicatif injectable (décision 0006) qui interroge un autre contexte ; il n'impose pas d'invariant |
| **Use case** | Orchestrateur à une méthode `execute`, sans logique métier ni méthode privée, câblé par `useFactory` |
| **Handler** | Réaction à un événement ; il délègue à un use case, il est idempotent, il journalise et n'interrompt pas l'opération d'origine |
| **Contrat** | Package `@cocooning/couple-contract` : schémas Zod de requête et de réponse, codes d'erreur, partagés par l'API et le client |
| **Shared kernel** | Primitives partagées : générique (`@cocooning/shared-kernel`) et du domaine (`@cocooning/couple-shared-kernel` : enums, routers) |
| **Router enum** | `ApiRouterEnum` et `WebRouterEnum` : aucune URL en dur, partagées par le front et le back |
| **Outbox** | Table d'événements écrite dans la même transaction que l'agrégat, publiée après commit par le relais de l'API (D6) |
| **Fake** | Implémentation de test d'un port écrite à la main, en `extends` du port, opposée au mock automatique (décision 0001) |
| **Feature Module Pattern** | Rangement d'un module web : `actions/`, `gateways/`, `presenters/`, `view-models/`, `services/`, `hooks/`, `ui/{containers,views,components}/` |
| **Container, vue** | Le container porte l'état et les hooks ; la vue est pure (décision 0009) |
| **Knowledge** | `_knowledge/` : règles de code numérotées, en anglais, importées par les `CLAUDE.md` |
| **Écart** | Entrée de registre `gaps/` qui constate une déviation du code par rapport à une règle, ou une décision à trancher |
| **Finding** | Constat de review : fichier, ligne, règle violée (`core.md rule N`), gravité, correctif (`_knowledge/core-review.md`) |
