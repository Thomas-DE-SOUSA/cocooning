export const NoteSheetCommandEnum = {
    CREATE_NOTE: 'CREATE_NOTE',
    CREATE_FOLDER: 'CREATE_FOLDER',
    RENAME_FOLDER: 'RENAME_FOLDER',
    EDIT_FOLDER_TEMPLATE: 'EDIT_FOLDER_TEMPLATE',
    DELETE_FOLDER: 'DELETE_FOLDER',
    MOVE_FOLDER: 'MOVE_FOLDER',
    MOVE_NOTE: 'MOVE_NOTE',
    DELETE_NOTE: 'DELETE_NOTE',
} as const;

export type NoteSheetCommand =
    (typeof NoteSheetCommandEnum)[keyof typeof NoteSheetCommandEnum];
