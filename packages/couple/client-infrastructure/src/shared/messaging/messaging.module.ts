import {
    AnswerPhotoPromptUseCase,
    GetInstantPhotoFileUseCase,
    GetPushPublicKeyUseCase,
    GetTodayPhotoPromptUseCase,
    ListMessageFeedUseCase,
    SendFlashMessageUseCase,
    SendInstantPhotoUseCase,
    SubscribePushNotificationsUseCase,
    UnsubscribePushNotificationsUseCase,
    WithdrawFlashMessageUseCase,
    WithdrawInstantPhotoUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveMessagingEndpoints } from './endpoints/messaging.endpoints';
import { ApiFlashMessageGateway } from './gateways/api-flash-message.gateway';
import { ApiInstantPhotoGateway } from './gateways/api-instant-photo.gateway';
import { ApiMessageFeedGateway } from './gateways/api-message-feed.gateway';
import { ApiPhotoPromptGateway } from './gateways/api-photo-prompt.gateway';
import { ApiPushSubscriptionGateway } from './gateways/api-push-subscription.gateway';

export type MessagingModule = {
    readonly listMessageFeed: ListMessageFeedUseCase;
    readonly sendFlashMessage: SendFlashMessageUseCase;
    readonly withdrawFlashMessage: WithdrawFlashMessageUseCase;
    readonly sendInstantPhoto: SendInstantPhotoUseCase;
    readonly withdrawInstantPhoto: WithdrawInstantPhotoUseCase;
    readonly getInstantPhotoFile: GetInstantPhotoFileUseCase;
    readonly getTodayPhotoPrompt: GetTodayPhotoPromptUseCase;
    readonly answerPhotoPrompt: AnswerPhotoPromptUseCase;
    readonly subscribePushNotifications: SubscribePushNotificationsUseCase;
    readonly unsubscribePushNotifications: UnsubscribePushNotificationsUseCase;
    readonly getPushPublicKey: GetPushPublicKeyUseCase;
};

// The gateways stay inside; getSessionToken is only called when a use case runs (decision 0036).
export function createMessagingModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): MessagingModule {
    const args = [
        resolveMessagingEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
        getSessionToken,
    ] as const;
    const feed = new ApiMessageFeedGateway(...args);
    const flashMessage = new ApiFlashMessageGateway(...args);
    const instantPhoto = new ApiInstantPhotoGateway(...args);
    const photoPrompt = new ApiPhotoPromptGateway(...args);
    const push = new ApiPushSubscriptionGateway(...args);
    return {
        listMessageFeed: new ListMessageFeedUseCase(feed),
        sendFlashMessage: new SendFlashMessageUseCase(flashMessage),
        withdrawFlashMessage: new WithdrawFlashMessageUseCase(flashMessage),
        sendInstantPhoto: new SendInstantPhotoUseCase(instantPhoto),
        withdrawInstantPhoto: new WithdrawInstantPhotoUseCase(instantPhoto),
        getInstantPhotoFile: new GetInstantPhotoFileUseCase(instantPhoto),
        getTodayPhotoPrompt: new GetTodayPhotoPromptUseCase(photoPrompt),
        answerPhotoPrompt: new AnswerPhotoPromptUseCase(photoPrompt),
        subscribePushNotifications: new SubscribePushNotificationsUseCase(push),
        unsubscribePushNotifications: new UnsubscribePushNotificationsUseCase(
            push,
        ),
        getPushPublicKey: new GetPushPublicKeyUseCase(push),
    };
}
