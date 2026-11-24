import type { RouteGroup } from '../route-group';

// Send and withdraw share the path of their kind, told apart by the HTTP verb.
export const MessagingRouteEnum = {
    MESSAGE_FEED_GET: '/message-feed',
    FLASH_MESSAGE_SEND: '/flash-messages',
    FLASH_MESSAGE_WITHDRAW: '/flash-messages/:flashMessageId',
    INSTANT_PHOTO_SEND: '/instant-photos',
    INSTANT_PHOTO_WITHDRAW: '/instant-photos/:instantPhotoId',
    INSTANT_PHOTO_FILE_GET: '/instant-photos/:instantPhotoId/file',
    PHOTO_PROMPT_TODAY_GET: '/photo-prompts/today',
    PHOTO_PROMPT_ANSWER: '/photo-prompts/:photoPromptId/instant-photos',
    PUSH_SUBSCRIPTION_SUBSCRIBE: '/push-subscriptions',
    PUSH_SUBSCRIPTION_UNSUBSCRIBE: '/push-subscriptions/unsubscribe',
    PUSH_SUBSCRIPTION_PUBLIC_KEY_GET: '/push-subscriptions/public-key',
} as const satisfies RouteGroup;
