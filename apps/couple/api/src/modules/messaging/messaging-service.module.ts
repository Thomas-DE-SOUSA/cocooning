import { Module } from '@nestjs/common';
import {
    AnswerPhotoPromptUseCase,
    GetInstantPhotoFileUseCase,
    GetTodayPhotoPromptUseCase,
    ListMessageFeedUseCase,
    MessagingCoupleGuardService,
    PairedCoupleProvider,
    SchedulePhotoPromptsUseCase,
    SendFlashMessageUseCase,
    SendInstantPhotoUseCase,
    WithdrawFlashMessageUseCase,
    WithdrawInstantPhotoUseCase,
} from '@cocooning/couple-server-business-logic/messaging';
import { MessagingSecondaryModule } from './messaging-secondary.module';
import { messagingUseCase } from './messaging-use-case.factory';

const useCases = [
    messagingUseCase(
        SendFlashMessageUseCase,
        (d) =>
            new SendFlashMessageUseCase(d.flashMessages, d.clock, d.publishing),
    ),
    messagingUseCase(
        SendInstantPhotoUseCase,
        (d) =>
            new SendInstantPhotoUseCase(
                d.instantPhotos,
                d.fileStorage,
                d.clock,
                d.publishing,
            ),
    ),
    messagingUseCase(
        ListMessageFeedUseCase,
        (d) => new ListMessageFeedUseCase(d.feed, d.photoOfTheDay),
    ),
    messagingUseCase(
        WithdrawFlashMessageUseCase,
        (d) =>
            new WithdrawFlashMessageUseCase(
                d.flashMessages,
                d.flashMessagePreconditions,
                d.clock,
                d.publishing,
            ),
    ),
    messagingUseCase(
        WithdrawInstantPhotoUseCase,
        (d) =>
            new WithdrawInstantPhotoUseCase(
                d.instantPhotos,
                d.instantPhotoPreconditions,
                d.fileStorage,
                d.clock,
                d.publishing,
            ),
    ),
    messagingUseCase(
        GetInstantPhotoFileUseCase,
        (d) => new GetInstantPhotoFileUseCase(d.instantPhotoPreconditions),
    ),
    messagingUseCase(
        SchedulePhotoPromptsUseCase,
        (d) =>
            new SchedulePhotoPromptsUseCase(
                d.photoPrompts,
                d.photoPromptSchedule,
                d.pairedCouples,
                d.clock,
                d.publishing,
            ),
    ),
    messagingUseCase(
        GetTodayPhotoPromptUseCase,
        (d) => new GetTodayPhotoPromptUseCase(d.photoOfTheDay, d.clock),
    ),
    messagingUseCase(
        AnswerPhotoPromptUseCase,
        (d) =>
            new AnswerPhotoPromptUseCase(
                d.instantPhotos,
                d.photoPromptPreconditions,
                d.fileStorage,
                d.clock,
                d.publishing,
            ),
    ),
];

// Decision 0006: the guard service reading pairing is a provider, injected where the couple of a request is needed.
const messagingCoupleGuardService = {
    provide: MessagingCoupleGuardService,
    inject: [PairedCoupleProvider],
    useFactory: (provider: PairedCoupleProvider) =>
        new MessagingCoupleGuardService(provider),
};

@Module({
    imports: [MessagingSecondaryModule],
    providers: [...useCases, messagingCoupleGuardService],
    exports: [
        MessagingSecondaryModule,
        ...useCases.map(({ provide }) => provide),
        MessagingCoupleGuardService,
    ],
})
export class MessagingServiceModule {}
