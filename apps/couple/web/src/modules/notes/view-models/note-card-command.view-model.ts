export const NoteCardCommandEnum = {
    ADD: 'ADD',
    CHOOSE: 'CHOOSE',
    REFINE: 'REFINE',
    REFRESH: 'REFRESH',
    CORRECT: 'CORRECT',
} as const;

export type NoteCardCommand =
    (typeof NoteCardCommandEnum)[keyof typeof NoteCardCommandEnum];
