import type {
    NoteCardResponse,
    NoteDetailResponse,
    NoteSpaceContentsResponse,
} from '@cocooning/couple-contract/notes';
import {
    NoteCardStatusEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { A_SHARED_NOTE } from './fake-notes.gateway';
import { A_SMART_FOLDER } from './note-folders-fixtures';

const UPDATED_AT = '2026-11-25T09:00:00.000Z';
const noteId = (suffix: string) =>
    `01936b2e-7c4a-7000-8000-0000000000${suffix}`;
const fieldsOf = (
    adresse: string | null,
    cuisine: string | null,
    prix: string | null,
) => [
    { name: 'Adresse', value: adresse, isManual: false },
    { name: 'Cuisine', value: cuisine, isManual: false },
    { name: 'Prix', value: prix, isManual: false },
];

// R21: « Prix » not found stays null; the card keeps its sources and the date of its search.
export const A_FILLED_NOTE_CARD: NoteCardResponse = {
    noteCardId: '01936b2e-7c4a-7000-8000-0000000000c1',
    noteId: noteId('f1'),
    status: NoteCardStatusEnum.FILLED,
    query: 'Chez Paul',
    fields: fieldsOf('13 rue de Charonne, Paris', 'Bistrot', null),
    candidates: [],
    sources: ['https://example.org/chez-paul'],
    searchedAt: UPDATED_AT,
    updatedAt: UPDATED_AT,
};

// R20: the note exists, its card waits for the search.
export const A_PENDING_NOTE_CARD: NoteCardResponse = {
    ...A_FILLED_NOTE_CARD,
    noteCardId: '01936b2e-7c4a-7000-8000-0000000000c2',
    noteId: noteId('f2'),
    status: NoteCardStatusEnum.PENDING,
    query: 'Le Bouchon',
    fields: fieldsOf(null, null, null),
    sources: [],
    searchedAt: null,
};

// R19: a doubt, the partner picks one of the candidates.
export const A_CHOOSING_NOTE_CARD: NoteCardResponse = {
    ...A_PENDING_NOTE_CARD,
    noteCardId: '01936b2e-7c4a-7000-8000-0000000000c3',
    noteId: noteId('f3'),
    status: NoteCardStatusEnum.CHOOSING,
    query: 'Café des Arts',
    candidates: [
        { label: 'Café des Arts', detail: 'Lyon 1er, brasserie' },
        { label: 'Café des Arts', detail: 'Paris 11e, bar à vin' },
    ],
    searchedAt: UPDATED_AT,
};

const aCardNote = (card: NoteCardResponse): NoteDetailResponse => ({
    ...A_SHARED_NOTE,
    noteId: card.noteId,
    title: card.query,
    folderId: A_SMART_FOLDER.folderId,
    updatedAt: UPDATED_AT,
    card,
});

// R18, R20: « Restaurants » opened, a filled card, one in search, one waiting for a choice.
export const A_SMART_SPACE_CONTENTS: NoteSpaceContentsResponse = {
    space: NoteSpaceEnum.SHARED,
    path: [{ folderId: A_SMART_FOLDER.folderId, name: A_SMART_FOLDER.name }],
    cardContext: {
        folderId: A_SMART_FOLDER.folderId,
        subject: 'Les restaurants où nous voulons aller',
        cardTemplate: ['Adresse', 'Cuisine', 'Prix'],
    },
    folders: [],
    notes: [A_FILLED_NOTE_CARD, A_PENDING_NOTE_CARD, A_CHOOSING_NOTE_CARD].map(
        aCardNote,
    ),
};
