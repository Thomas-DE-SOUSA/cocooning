import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    type MovedItem,
    MovedItemKindEnum,
} from '../view-models/moved-item.view-model';
import type { NotePlace } from '../view-models/note-place.view-model';
import type {
    FolderListItem,
    NotePlaceLevel,
} from '../view-models/note-space-screen.view-model';
import type { NoteListItem } from '../view-models/notes-screen.view-model';
import { presentLocation } from './note-place.presenter';

const BOTH_SPACES: readonly NoteSpace[] = Object.values(NoteSpaceEnum);

// R5, R11: the owner puts her note in either space; the other's note stays in « Partagé ».
export const presentMovedNote = (
    note: NoteListItem,
    place: NotePlace,
): MovedItem => ({
    kind: MovedItemKindEnum.NOTE,
    id: note.noteId,
    name: note.title,
    from: presentLocation(place),
    spaces: note.isOwner ? BOTH_SPACES : [NoteSpaceEnum.SHARED],
});

// R15: a folder stays in its space.
export const presentMovedFolder = (
    folder: FolderListItem,
    place: NotePlace,
): MovedItem => ({
    kind: MovedItemKindEnum.FOLDER,
    id: folder.folderId,
    name: folder.name,
    from: presentLocation(place),
    spaces: [place.space],
});

// A folder is never shown inside itself: its sub-folders, where it may not go (R15), stay out of reach.
export const presentPickerFolders = (
    level: NotePlaceLevel,
    item: MovedItem,
): readonly FolderListItem[] =>
    item.kind === MovedItemKindEnum.FOLDER
        ? level.folders.filter((folder) => folder.folderId !== item.id)
        : level.folders;

// « Déplacer ici » waits while the level shown is where the item already is.
export function isWhereItIs(level: NotePlaceLevel, item: MovedItem): boolean {
    const here = presentLocation(level.place);
    return (
        here.space === item.from.space && here.folderId === item.from.folderId
    );
}
