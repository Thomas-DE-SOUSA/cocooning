export const NoteCardCommandEnum = {
    ADD: 'ADD',
    CHOOSE: 'CHOOSE',
    REFINE: 'REFINE',
} as const;

export type NoteCardCommand =
    (typeof NoteCardCommandEnum)[keyof typeof NoteCardCommandEnum];
