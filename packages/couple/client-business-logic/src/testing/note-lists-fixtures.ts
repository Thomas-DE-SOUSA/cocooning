import type {
    NoteListIndexResponse,
    NoteListResponse,
} from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';

// R26, R28: a shared grocery list with three lines left, and a private task list.
export const A_GROCERY_LIST: NoteListResponse = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000e1',
    title: 'Carrefour',
    emoji: '🛒',
    visibility: NoteVisibilityEnum.SHARED,
    isOwner: true,
    openItemCount: 3,
    updatedAt: '2026-11-26T08:00:00.000Z',
};

export const A_PRIVATE_TASK_LIST: NoteListResponse = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000e2',
    title: 'Noël',
    emoji: '🎄',
    visibility: NoteVisibilityEnum.PRIVATE,
    isOwner: true,
    openItemCount: 2,
    updatedAt: '2026-11-25T18:00:00.000Z',
};

// The home of « Courses »: the shared list, then a private one with nothing left to check.
export const A_NOTE_LIST_INDEX: NoteListIndexResponse = {
    items: [
        A_GROCERY_LIST,
        {
            noteId: '01936b2e-7c4a-7000-8000-0000000000e3',
            title: 'Pharmacie',
            emoji: null,
            visibility: NoteVisibilityEnum.PRIVATE,
            isOwner: true,
            openItemCount: 0,
            updatedAt: '2026-11-24T10:00:00.000Z',
        },
    ],
};
