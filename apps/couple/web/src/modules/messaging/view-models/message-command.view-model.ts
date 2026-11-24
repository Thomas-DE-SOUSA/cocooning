// The writes of the messages screen. A ready-made word is a flash message, but sending it leaves the typed word alone;
// a photo of the day is sent like a spontaneous photo, through its prompt (R8).
export const MessageCommandEnum = {
    SEND_FLASH_MESSAGE: 'SEND_FLASH_MESSAGE',
    SEND_READY_WORD: 'SEND_READY_WORD',
    SEND_INSTANT_PHOTO: 'SEND_INSTANT_PHOTO',
    WITHDRAW: 'WITHDRAW',
} as const;

export type MessageCommand =
    (typeof MessageCommandEnum)[keyof typeof MessageCommandEnum];

export const MessageCommandFailureFollowUpEnum = {
    SIGN_IN: 'SIGN_IN',
    REFRESH: 'REFRESH',
    NONE: 'NONE',
} as const;

export type MessageCommandFailureFollowUp =
    (typeof MessageCommandFailureFollowUpEnum)[keyof typeof MessageCommandFailureFollowUpEnum];

// A photo taken by the phone camera, waiting in the preview; photoPromptId names the prompt it answers, or null.
export type CapturedPhoto = {
    readonly file: File;
    readonly previewUrl: string;
    readonly photoPromptId: string | null;
};
