export const NoteCommandEnum = {
    CREATE_NOTE: 'CREATE_NOTE',
    SHARE_NOTE: 'SHARE_NOTE',
    MAKE_NOTE_PRIVATE: 'MAKE_NOTE_PRIVATE',
    DELETE_NOTE: 'DELETE_NOTE',
} as const;

export type NoteCommand =
    (typeof NoteCommandEnum)[keyof typeof NoteCommandEnum];

// The running command and the note it acts on; null for a creation.
export type PendingNoteCommand = {
    readonly command: NoteCommand;
    readonly noteId: string | null;
};

export const NoteCommandFailureFollowUpEnum = {
    SIGN_IN: 'SIGN_IN',
    REFRESH: 'REFRESH',
    NONE: 'NONE',
} as const;

export type NoteCommandFailureFollowUp =
    (typeof NoteCommandFailureFollowUpEnum)[keyof typeof NoteCommandFailureFollowUpEnum];
