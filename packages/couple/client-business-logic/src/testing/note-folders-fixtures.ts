import type {
    FolderResponse,
    NoteSpaceContentsResponse,
    NoteSpacesResponse,
} from '@cocooning/couple-contract/notes';
import {
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { A_SHARED_NOTE } from './fake-notes.gateway';

export const A_SHARED_FOLDER: FolderResponse = {
    folderId: '01936b2e-7c4a-7000-8000-0000000000e1',
    space: NoteSpaceEnum.SHARED,
    kind: FolderKindEnum.CLASSIC,
    parentFolderId: null,
    name: 'Vacances',
    subject: null,
    cardTemplate: null,
    updatedAt: '2026-11-25T08:00:00.000Z',
};

// R10: « Partagé » then « Privé ».
export const THE_NOTE_SPACES: NoteSpacesResponse = {
    spaces: [
        { space: NoteSpaceEnum.SHARED, folderCount: 1, noteCount: 1 },
        { space: NoteSpaceEnum.PRIVATE, folderCount: 0, noteCount: 0 },
    ],
};

// The root of « Partagé »: one folder, one note.
export const A_SPACE_CONTENTS: NoteSpaceContentsResponse = {
    space: NoteSpaceEnum.SHARED,
    path: [],
    folders: [{ ...A_SHARED_FOLDER, folderCount: 0, noteCount: 2 }],
    notes: [A_SHARED_NOTE],
};
