import { Module } from '@nestjs/common';
import { MessagingServiceModule } from './messaging-service.module';
import {
    AnswerPhotoPromptController,
    GetInstantPhotoFileController,
    GetPushPublicKeyController,
    GetTodayPhotoPromptController,
    ListMessageFeedController,
    SendFlashMessageController,
    SendInstantPhotoController,
    SubscribePushNotificationsController,
    UnsubscribePushNotificationsController,
    WithdrawFlashMessageController,
    WithdrawInstantPhotoController,
} from './primary/controllers';
import { MessagingCoupleGuard } from './primary/couple';
import {
    OutboxRelayScheduler,
    PhotoPromptScheduler,
} from './primary/scheduler';

@Module({
    imports: [MessagingServiceModule],
    controllers: [
        ListMessageFeedController,
        SendFlashMessageController,
        WithdrawFlashMessageController,
        SendInstantPhotoController,
        WithdrawInstantPhotoController,
        GetInstantPhotoFileController,
        GetTodayPhotoPromptController,
        AnswerPhotoPromptController,
        SubscribePushNotificationsController,
        UnsubscribePushNotificationsController,
        GetPushPublicKeyController,
    ],
    providers: [
        MessagingCoupleGuard,
        PhotoPromptScheduler,
        OutboxRelayScheduler,
    ],
})
export class MessagingModule {}
