import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type MessagingEndpoints = {
    readonly messageFeed: string;
    readonly flashMessages: string;
    readonly flashMessage: (flashMessageId: string) => string;
    readonly instantPhotos: string;
    readonly instantPhoto: (instantPhotoId: string) => string;
    readonly instantPhotoFile: (instantPhotoId: string) => string;
    readonly todayPhotoPrompt: string;
    readonly photoPromptAnswer: (photoPromptId: string) => string;
    readonly pushSubscribe: string;
    readonly pushUnsubscribe: string;
    readonly pushPublicKey: string;
};

export function resolveMessagingEndpoints(
    apiBaseUrl: string,
): MessagingEndpoints {
    const route = (path: string, params: Record<string, string> = {}) =>
        resolveRoute(apiBaseUrl, path, params);
    return {
        messageFeed: route(ApiRouterEnum.MESSAGE_FEED_GET),
        flashMessages: route(ApiRouterEnum.FLASH_MESSAGE_SEND),
        flashMessage: (flashMessageId) =>
            route(ApiRouterEnum.FLASH_MESSAGE_WITHDRAW, { flashMessageId }),
        instantPhotos: route(ApiRouterEnum.INSTANT_PHOTO_SEND),
        instantPhoto: (instantPhotoId) =>
            route(ApiRouterEnum.INSTANT_PHOTO_WITHDRAW, { instantPhotoId }),
        instantPhotoFile: (instantPhotoId) =>
            route(ApiRouterEnum.INSTANT_PHOTO_FILE_GET, { instantPhotoId }),
        todayPhotoPrompt: route(ApiRouterEnum.PHOTO_PROMPT_TODAY_GET),
        photoPromptAnswer: (photoPromptId) =>
            route(ApiRouterEnum.PHOTO_PROMPT_ANSWER, { photoPromptId }),
        pushSubscribe: route(ApiRouterEnum.PUSH_SUBSCRIPTION_SUBSCRIBE),
        pushUnsubscribe: route(ApiRouterEnum.PUSH_SUBSCRIPTION_UNSUBSCRIBE),
        pushPublicKey: route(ApiRouterEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY_GET),
    };
}
