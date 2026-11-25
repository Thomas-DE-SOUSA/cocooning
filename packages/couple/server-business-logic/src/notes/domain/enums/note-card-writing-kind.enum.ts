// R19, R21: what the AI made of the texts found: several distinct items (candidates), or the values of one.
export const NoteCardWritingKindEnum = {
    CANDIDATES: 'CANDIDATES',
    VALUES: 'VALUES',
} as const;

export type NoteCardWritingKind =
    (typeof NoteCardWritingKindEnum)[keyof typeof NoteCardWritingKindEnum];
