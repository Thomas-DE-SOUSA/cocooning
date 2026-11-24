import { Module } from '@nestjs/common';
import {
    FlashMessageRepository,
    InstantPhotoRepository,
    OutboxEventRepository,
    PairedCoupleProvider,
    PhotoPromptRepository,
    PushSubscriptionRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import {
    PairedCouplePrismaProvider,
    webPushNotificationSenderProvider,
} from './secondary/providers';
import {
    FlashMessagePrismaRepository,
    InstantPhotoPrismaRepository,
    OutboxEventPrismaRepository,
    PhotoPromptPrismaRepository,
    PushSubscriptionPrismaRepository,
} from './secondary/repositories';

// FileStorage is provided once, by the global StorageModule of AppModule (wiring.md rule 9).
const adapters = [
    {
        provide: FlashMessageRepository,
        useClass: FlashMessagePrismaRepository,
    },
    {
        provide: InstantPhotoRepository,
        useClass: InstantPhotoPrismaRepository,
    },
    { provide: PhotoPromptRepository, useClass: PhotoPromptPrismaRepository },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
    {
        provide: PushSubscriptionRepository,
        useClass: PushSubscriptionPrismaRepository,
    },
    { provide: OutboxEventRepository, useClass: OutboxEventPrismaRepository },
];

@Module({
    providers: [...adapters, webPushNotificationSenderProvider],
    exports: [
        ...adapters.map(({ provide }) => provide),
        webPushNotificationSenderProvider.provide,
    ],
})
export class MessagingSecondaryModule {}
