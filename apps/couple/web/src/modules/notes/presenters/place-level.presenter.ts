import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    FolderTemplate,
    NotePlaceLevel,
} from '../view-models/note-space-screen.view-model';
import { presentNotePlace, presentPathPlaces } from './note-place.presenter';

type FolderEntry = NoteSpaceContentsResponse['folders'][number];

// R18: a smart folder holds its subject and fields; a sub-folder of a smart tree reads those of the place it is in.
const templateOf = (
    folder: FolderEntry,
    { cardContext }: NoteSpaceContentsResponse,
): FolderTemplate | null => {
    if (folder.subject !== null && folder.cardTemplate !== null) {
        return { subject: folder.subject, fields: folder.cardTemplate };
    }
    if (folder.kind !== FolderKindEnum.SMART || cardContext === null) {
        return null;
    }
    return { subject: cardContext.subject, fields: cardContext.cardTemplate };
};

// The place read, the way back from it, and its folders with what each holds (R13), whether it is smart and the card
// template it reads (R17, R18).
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
            isSmart: folder.kind === FolderKindEnum.SMART,
            template: templateOf(folder, contents),
        })),
    };
}
