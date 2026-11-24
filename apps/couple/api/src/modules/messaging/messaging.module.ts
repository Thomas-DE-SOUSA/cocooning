import { Module } from '@nestjs/common';
import { MessagingServiceModule } from './messaging-service.module';
import {
    GetInstantPhotoFileController,
    ListMessageFeedController,
    SendFlashMessageController,
    SendInstantPhotoController,
    WithdrawFlashMessageController,
    WithdrawInstantPhotoController,
} from './primary/controllers';
import { MessagingCoupleGuard } from './primary/couple';

@Module({
    imports: [MessagingServiceModule],
    controllers: [
        ListMessageFeedController,
        SendFlashMessageController,
        WithdrawFlashMessageController,
        SendInstantPhotoController,
        WithdrawInstantPhotoController,
        GetInstantPhotoFileController,
    ],
    providers: [MessagingCoupleGuard],
})
export class MessagingModule {}
