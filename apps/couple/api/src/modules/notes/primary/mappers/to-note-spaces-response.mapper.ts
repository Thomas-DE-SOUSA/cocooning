import type { NoteSpacesResponse } from '@cocooning/couple-contract/notes';
import type { NoteSpacesView } from '@cocooning/couple-server-business-logic/notes';

export const toNoteSpacesResponse = (
    view: NoteSpacesView,
): NoteSpacesResponse => ({
    spaces: view.spaces.map(({ space, folderCount, noteCount }) => ({
        space,
        folderCount,
        noteCount,
    })),
});
