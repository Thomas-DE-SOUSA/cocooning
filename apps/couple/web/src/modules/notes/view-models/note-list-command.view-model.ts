export const NoteListCommandEnum = {
    CREATE_LIST: 'CREATE_LIST',
} as const;

export type NoteListCommand =
    (typeof NoteListCommandEnum)[keyof typeof NoteListCommandEnum];
