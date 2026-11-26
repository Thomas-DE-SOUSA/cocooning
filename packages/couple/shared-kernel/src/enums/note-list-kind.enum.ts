// R26 of notes: the section of the Lists tab a list lives in; an ordinary note has none (null).
export const NoteListKindEnum = {
    GROCERIES: 'GROCERIES',
    TASKS: 'TASKS',
} as const;

export type NoteListKind =
    (typeof NoteListKindEnum)[keyof typeof NoteListKindEnum];
