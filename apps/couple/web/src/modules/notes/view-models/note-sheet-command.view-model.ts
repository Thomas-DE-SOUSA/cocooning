export const NoteSheetCommandEnum = {
    CREATE_NOTE: 'CREATE_NOTE',
    CREATE_FOLDER: 'CREATE_FOLDER',
    RENAME_FOLDER: 'RENAME_FOLDER',
    DELETE_FOLDER: 'DELETE_FOLDER',
} as const;

export type NoteSheetCommand =
    (typeof NoteSheetCommandEnum)[keyof typeof NoteSheetCommandEnum];
