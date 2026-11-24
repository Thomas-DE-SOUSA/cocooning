import { Module } from '@nestjs/common';
import {
    FlashMessageRepository,
    InstantPhotoRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/messaging';
import { PairedCouplePrismaProvider } from './secondary/providers';
import {
    FlashMessagePrismaRepository,
    InstantPhotoPrismaRepository,
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
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
];

@Module({
    providers: adapters,
    exports: adapters.map(({ provide }) => provide),
})
export class MessagingSecondaryModule {}
