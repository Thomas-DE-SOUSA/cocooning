import { Module } from '@nestjs/common';
import { MessagingServiceModule } from './messaging-service.module';
import {
    AnswerPhotoPromptController,
    GetInstantPhotoFileController,
    GetTodayPhotoPromptController,
    ListMessageFeedController,
    SendFlashMessageController,
    SendInstantPhotoController,
    WithdrawFlashMessageController,
    WithdrawInstantPhotoController,
} from './primary/controllers';
import { MessagingCoupleGuard } from './primary/couple';
import { PhotoPromptScheduler } from './primary/scheduler';

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
    ],
    providers: [MessagingCoupleGuard, PhotoPromptScheduler],
})
export class MessagingModule {}
