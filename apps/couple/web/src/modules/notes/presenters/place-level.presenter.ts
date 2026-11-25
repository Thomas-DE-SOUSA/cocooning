import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { NotePlaceLevel } from '../view-models/note-space-screen.view-model';
import { presentNotePlace, presentPathPlaces } from './note-place.presenter';

// The place read, the way back from it, and its folders with what each holds (R13).
export function presentPlaceLevel(
    contents: NoteSpaceContentsResponse,
): NotePlaceLevel {
    const { space } = contents;
    return {
        ...presentPathPlaces(space, contents.path),
        folders: contents.folders.map((folder) => ({
            folderId: folder.folderId,
            name: folder.name,
            href: presentNotePlace(space, folder).href,
            folderCount: folder.folderCount,
            noteCount: folder.noteCount,
        })),
    };
}
