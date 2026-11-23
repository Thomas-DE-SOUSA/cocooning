export const NoteVisibilityEnum = {
    PRIVATE: 'PRIVATE',
    SHARED: 'SHARED',
} as const;

export type NoteVisibility =
    (typeof NoteVisibilityEnum)[keyof typeof NoteVisibilityEnum];
