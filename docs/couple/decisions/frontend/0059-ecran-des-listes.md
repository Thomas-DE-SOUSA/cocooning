---
nature: technique
status: proposée
date: 2026-11-26
deciders: [Thomas De Sousa]
validated-by: à compléter
validated-on:
supersedes:
superseded-by:
premortem:
---

# 0059: L'écran des listes coche les lignes dans le document Yjs de la note

## Contexte

La [décision 0058](../notes/0058-listes-sur-les-notes.md) fait d'une liste de courses ou de tâches une note à cocher, écrite à deux par le canal temps réel des notes ([décision 0040](../notes/0040-edition-a-deux-par-hocuspocus-dans-l-api.md)). Le serveur compte les lignes restantes en lisant le fragment Tiptap `default` du document : les éléments `taskItem` dont `checked` n'est pas vrai, à toute profondeur (R28, `YjsNoteChecklistReader`). L'écran doit dire qui a coché chaque ligne (R29), descendre les lignes cochées dans « Fait » sans changer l'ordre du document (R30), vider les faits pour les deux d'un coup (R31) et montrer la présence de l'autre (R32). La maquette `Listes` a été validée (« go », 2026-11-26).

## Décision

1. **Le document garde la forme que Tiptap écrit** : `taskList > taskItem[checked, checkedBy, lineId] > paragraph > texte`, dans le fragment `default`. `checked` reste un booléen, `checkedBy` est l'identifiant du partenaire qui a coché (absent pour une ligne ouverte), `lineId` un identifiant stable tiré au navigateur. Le décompte du serveur reste juste sans changer l'API.
2. **L'éditeur des notes connaît ces deux attributs** (`NoteTaskItem`, extension de `TaskItem`) : sans eux, y-prosemirror les effacerait à la première frappe dans une note qui a des cases. Une note ordinaire n'en a pas l'usage et ne change pas.
3. **La page d'une liste n'est pas un éditeur Tiptap** : elle lit les lignes du fragment (`readChecklist`) et les change par des transactions Yjs (`addChecklistLine`, `writeChecklistLine`, `writeChecklistText`, `removeChecklistLines`), sous `useSyncExternalStore`. Le passage en « Fait » est un affichage (`presentChecklist`) : cocher ne déplace jamais la ligne dans le document. « Vider les faits » retire toutes les lignes cochées dans une seule transaction, que l'autre téléphone reçoit en une mise à jour. La page d'une note renvoie une liste vers sa page, l'éditeur n'en ouvre jamais.
4. **Qui regarde** est connu par la page serveur : `ownerId` pour la propriétaire, sinon l'autre partenaire du couple (`GET /pairing/couple`). La PWA ne lit pas l'identité dans la session.
5. **La présence** passe par l'awareness de Hocuspocus : chaque téléphone sur une liste y partage son `viewerId`, et la page montre « Ton âme sœur est dans la liste » quand un autre lecteur y est. Aucun code serveur.
6. **Les routes** : `/lists?section=` (Courses par défaut, Tâches, Envies) et `/lists/:noteId`, toutes deux sous la barre d'onglets, « Listes » active. Le champ d'ajout est en haut de la page : le clavier ne le cache pas, contrairement à l'éditeur d'une note ([décision 0044](0044-navigation-par-onglets.md), point 4). La barre passe à cinq onglets, pastille de 48 px.
7. **Supprimer une ligne** : glissement vers la gauche, comme l'agenda ([décision 0049](0049-suppression-par-glissement.md)), sans confirmation. **Vider les faits** demande une confirmation dans une feuille : l'app n'a pas d'annulation par toast. Le « ⋯ » d'une liste change titre et emoji (les deux partenaires) et la supprime (sa propriétaire), comme les notes ([décision 0053](0053-ecran-des-espaces-et-des-dossiers.md)).
8. Le code reste dans le module web `notes` : une liste est une note, et un module n'importe pas l'intérieur d'un autre ([décision 0011](0011-pwa-rangee-par-fonctionnalite.md)).

## Alternatives écartées

- **Un éditeur Tiptap pour la page d'une liste** : l'ordre visuel (ouvertes puis « Fait ») ne suit pas l'ordre du document, et il faudrait une vue de nœud pour la couleur et « Moi » / « Toi ».
- **Déplacer la ligne cochée en bas du document** : deux coches simultanées réordonneraient la liste chez l'autre ; décocher ne la remettrait pas à sa place.
- **Un module web `lists`** : il devrait importer l'adaptateur Hocuspocus, le document et les commandes des notes par leur point d'entrée, que la décision 0011 réserve aux routes.
- **Un `userId` lu dans la session** : la PWA ne le connaît pas aujourd'hui ; le couple le donne déjà.

## Conséquences

- [Règles des listes](../../business-rules/notes/rules/lists.md) R26 à R32 : lignes « Dans le code » de la PWA ; [canal temps réel, section « Dans la PWA »](../../architecture/notes/collaboration.md) ; [front de la PWA](../../architecture/frontend/index.md).
- Le module web `notes` gagne `gateways/yjs/`, le port `LineIdGenerator` et les `ListDocumentEvents` du port `NoteDocumentGateway`.

## Risques

- Une ligne tapée dans l'éditeur des notes n'a pas de `lineId` : elle est connue par sa place, qui change si une autre ligne est retirée en même temps. Les listes ne s'ouvrent que dans leur page, où chaque ligne reçoit son identifiant.
- Avant la première synchronisation, une ligne ajoutée hors ligne crée sa propre `taskList` ; les deux se fusionnent et restent comptées.
- Le clavier de l'iPhone avec la barre d'onglets et le champ d'ajout n'est vu qu'en jsdom : à essayer sur les deux téléphones.
