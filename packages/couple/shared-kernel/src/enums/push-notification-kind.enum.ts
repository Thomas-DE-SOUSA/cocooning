// What a push notification says, and nothing else: the PWA turns the kind into its French sentence (R10, core.md rule 33).
export const PushNotificationKindEnum = {
    MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
    PHOTO_PROMPT_ISSUED: 'PHOTO_PROMPT_ISSUED',
    CALENDAR_EVENT_ADDED: 'CALENDAR_EVENT_ADDED',
    NOTE_SHARED: 'NOTE_SHARED',
} as const;

export type PushNotificationKind =
    (typeof PushNotificationKindEnum)[keyof typeof PushNotificationKindEnum];
