// The « ⋯ » sheet of a list (decision 0053): its actions, then on the spot the title and emoji or the deletion.
export const NoteListSheetStepEnum = {
    ACTIONS: 'ACTIONS',
    DETAILS: 'DETAILS',
    DELETION: 'DELETION',
} as const;

export type NoteListSheetStep =
    (typeof NoteListSheetStepEnum)[keyof typeof NoteListSheetStepEnum];
