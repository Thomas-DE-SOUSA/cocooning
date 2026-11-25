import type { NoteSheetCommand } from '../view-models/note-sheet-command.view-model';

// The title of the toast of a refused command, in the namespace of the space screen.
export const NOTE_SHEET_FAILURE_KEYS: Readonly<
    Record<NoteSheetCommand, string>
> = {
    CREATE_NOTE: 'toast.createNoteFailed',
    CREATE_FOLDER: 'toast.createFolderFailed',
    RENAME_FOLDER: 'toast.renameFolderFailed',
    DELETE_FOLDER: 'toast.deleteFolderFailed',
    MOVE_FOLDER: 'toast.moveFailed',
    MOVE_NOTE: 'toast.moveFailed',
    DELETE_NOTE: 'toast.deleteNoteFailed',
};
