export const NoteListCommandEnum = {
    CREATE_LIST: 'CREATE_LIST',
    EDIT_LIST: 'EDIT_LIST',
    DELETE_LIST: 'DELETE_LIST',
} as const;

export type NoteListCommand =
    (typeof NoteListCommandEnum)[keyof typeof NoteListCommandEnum];
