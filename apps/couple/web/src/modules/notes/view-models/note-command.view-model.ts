export const NoteCommandFailureFollowUpEnum = {
    SIGN_IN: 'SIGN_IN',
    REFRESH: 'REFRESH',
    NONE: 'NONE',
} as const;

export type NoteCommandFailureFollowUp =
    (typeof NoteCommandFailureFollowUpEnum)[keyof typeof NoteCommandFailureFollowUpEnum];
