import type { RouteGroup } from '../route-group';

// Send and withdraw share the path of their kind, told apart by the HTTP verb.
export const MessagingRouteEnum = {
    MESSAGE_FEED_GET: '/message-feed',
    FLASH_MESSAGE_SEND: '/flash-messages',
    FLASH_MESSAGE_WITHDRAW: '/flash-messages/:flashMessageId',
    INSTANT_PHOTO_SEND: '/instant-photos',
    INSTANT_PHOTO_WITHDRAW: '/instant-photos/:instantPhotoId',
    INSTANT_PHOTO_FILE_GET: '/instant-photos/:instantPhotoId/file',
} as const satisfies RouteGroup;
