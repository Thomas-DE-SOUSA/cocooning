# Édition à deux en temps réel

Cette page décrit le canal temps réel des notes : comment l'API reçoit les WebSockets, contrôle l'accès, charge et enregistre le document Yjs, et déconnecte un éditeur qui perd une note. À lire avant de toucher à `apps/couple/api/src/modules/notes/primary/collaboration/` ou à `secondary/collaboration/`.

## Rôle et limites

Le contenu d'une note est un document Yjs ([décision 0040](../../decisions/notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)), synchronisé entre les deux téléphones par Hocuspocus 4, dans le processus de l'API. Le canal ne connaît ni le titre ni la visibilité : il demande au contexte `notes` qui peut ouvrir une note, et lui confie l'état à enregistrer. Le document porte le nom de la note (`noteId`).

## Comment c'est construit

| Élément | Rôle | Chemin (depuis `apps/couple/api/src/modules/notes/`) |
|---|---|---|
| `NoteHocuspocus` | L'unique instance Hocuspocus de l'API, partagée par le serveur et l'adaptateur de déconnexion | `secondary/collaboration/note-hocuspocus.ts` |
| `NoteCollaborationServer` | Adaptateur primaire : pose les crochets au démarrage, ouvre les WebSockets sur `ApiRouterEnum.NOTE_COLLABORATION` (`/collab`) du serveur HTTP de l'API, ferme tout avant l'arrêt | `primary/collaboration/note-collaboration.server.ts` |
| `bridgeWebSockets` | Ce que fait le `Server` de Hocuspocus avec crossws, écrit avec `ws` : crossws n'existe qu'en ESM (D31) | `primary/collaboration/websocket-bridge.ts` |
| `noteCollaborationHooks` | `onAuthenticate`, `onLoadDocument`, `onStoreDocument`, chacun délégué à un use case | `primary/collaboration/note-collaboration.hooks.ts` |
| `reportingFailure` | Journalise un refus (`warn`, code) ou une panne (`error`), par identifiants seulement, puis échoue sans message : Hocuspocus n'imprime alors rien | `primary/collaboration/hook-failure.ts` |
| `HocuspocusNoteCollaborationProvider` | Adaptateur de `NoteCollaborationProvider` : ferme les connexions d'un document | `secondary/collaboration/hocuspocus-note-collaboration.provider.ts` |
| `NoteContentPrismaRepository` | Adaptateur de `NoteContentRepository` : colonne `content_state` de la note | `secondary/repositories/note-content-prisma.repository.ts` |
| `esm-packages.ts` | Charge Hocuspocus et Yjs par leur entrée `require` et les type par leurs déclarations ESM, seul endroit qui le fait | `esm-packages.ts` |

## Flux principal

1. Le navigateur ouvre `wss://<nom>.ts.net/collab` ; même origine que la PWA, le cookie `cocooning_session` part avec la poignée de main.
2. `onAuthenticate` lit le cookie, résout la session (`ResolveSessionUseCase`), puis le couple formé (`NoteCoupleGuardService`), puis `AuthorizeNoteDocumentUseCase` vérifie que la note est visible pour ce partenaire (R4). Sinon la connexion est refusée sans dire pourquoi. L'`ExecutionContext` devient le contexte de la connexion.
3. Au premier éditeur, `onLoadDocument` applique l'état stocké (`LoadNoteDocumentUseCase`), ou part d'un document vide.
4. Après un court délai sans frappe, et à la fermeture du dernier éditeur, `onStoreDocument` enregistre l'état complet (`SaveNoteDocumentUseCase`) dans `content_state`, avec `updated_at` : la liste remonte la note modifiée.
5. Quand la propriétaire rend la note privée, `MakeNotePrivateUseCase` appelle `disconnectAllBut(noteId, ownerId)` : l'autre partenaire perd le document, la propriétaire continue d'écrire (R5). Une suppression appelle `disconnectEveryone(noteId)` (R7).

## Points d'attention

- **Fermeture d'un document.** Le serveur ferme la connexion au document, pas le WebSocket ; le provider ne la rouvre pas seul. La PWA rouvre la note, et le nouveau contrôle d'accès refuse celui qui l'a perdue.
- **Arrêt de l'API.** `beforeApplicationShutdown` écrit les états en attente et ferme les sockets avant que NestJS ferme le serveur HTTP, qui sinon attendrait les connexions ouvertes.
- **Enregistrement sans contrôle de visibilité.** L'accès est contrôlé à la connexion ; l'écriture reste dans le couple de la connexion, et une note supprimée n'en garde rien.
- **Contenu du couple.** Ni le contenu ni le titre n'atteignent un log (`core.md` règle 33).
- Tests : `apps/couple/api/test/notes/note-collaboration.e2e-spec.ts`, avec un vrai `HocuspocusProvider` (`collaboration-editor.ts`).
