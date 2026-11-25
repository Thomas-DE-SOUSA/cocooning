import type { NotePlace } from './note-place.view-model';

export const NoteSheetKindEnum = {
    NEW_NOTE: 'NEW_NOTE',
    NEW_FOLDER: 'NEW_FOLDER',
} as const;

// What the bottom sheet of the notes shows; a creation happens in the place shown by the screen (R13).
export type NoteSheetTarget = {
    readonly kind:
        typeof NoteSheetKindEnum.NEW_NOTE | typeof NoteSheetKindEnum.NEW_FOLDER;
    readonly place: NotePlace;
};

// The words of a folder name sheet, translated by its container: a new folder or a renamed one.
export type FolderNameSheetLabels = {
    readonly title: string;
    readonly description: string;
    readonly submit: string;
    readonly pending: string;
};
