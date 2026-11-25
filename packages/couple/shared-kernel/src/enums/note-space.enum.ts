// R10: the two roots of the notes; a note takes the visibility of its space (R11).
export const NoteSpaceEnum = {
    SHARED: 'SHARED',
    PRIVATE: 'PRIVATE',
} as const;

export type NoteSpace = (typeof NoteSpaceEnum)[keyof typeof NoteSpaceEnum];
