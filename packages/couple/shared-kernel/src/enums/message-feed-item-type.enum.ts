// The two kinds of item of the message feed (R5).
export const MessageFeedItemTypeEnum = {
    FLASH_MESSAGE: 'FLASH_MESSAGE',
    INSTANT_PHOTO: 'INSTANT_PHOTO',
} as const;

export type MessageFeedItemType =
    (typeof MessageFeedItemTypeEnum)[keyof typeof MessageFeedItemTypeEnum];
