export const NoteCardCommandEnum = {
    ADD: 'ADD',
} as const;

export type NoteCardCommand =
    (typeof NoteCardCommandEnum)[keyof typeof NoteCardCommandEnum];
