export const NoteSheetCommandEnum = {
    CREATE_NOTE: 'CREATE_NOTE',
    CREATE_FOLDER: 'CREATE_FOLDER',
} as const;

export type NoteSheetCommand =
    (typeof NoteSheetCommandEnum)[keyof typeof NoteSheetCommandEnum];
