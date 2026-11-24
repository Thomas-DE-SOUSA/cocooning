import type { FactoryProvider, Type } from '@nestjs/common';
import {
    FlashMessagePreconditionService,
    FlashMessageRepository,
    InstantPhotoPreconditionService,
    InstantPhotoRepository,
    MessageFeedService,
} from '@cocooning/couple-server-business-logic/messaging';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    FileStorage,
    Logger,
} from '@cocooning/shared-kernel/ports';

export type MessagingDependencies = {
    readonly flashMessages: FlashMessageRepository;
    readonly instantPhotos: InstantPhotoRepository;
    readonly fileStorage: FileStorage;
    readonly flashMessagePreconditions: FlashMessagePreconditionService;
    readonly instantPhotoPreconditions: InstantPhotoPreconditionService;
    readonly feed: MessageFeedService;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    FlashMessageRepository,
    InstantPhotoRepository,
    FileStorage,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

// Domain services are created inline, never providers (decision 0005).
const collect = (
    flashMessages: FlashMessageRepository,
    instantPhotos: InstantPhotoRepository,
    fileStorage: FileStorage,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): MessagingDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        flashMessages,
        instantPhotos,
        fileStorage,
        flashMessagePreconditions: new FlashMessagePreconditionService(
            flashMessages,
        ),
        instantPhotoPreconditions: new InstantPhotoPreconditionService(
            instantPhotos,
            fileStorage,
        ),
        feed: new MessageFeedService(flashMessages, instantPhotos),
        clock,
        publishing: new EventPublishingService(publisher, logger),
    };
};

// A typed token: pairing one use case's token with another's factory does not compile.
export const messagingUseCase = <T>(
    provide: Type<T>,
    build: (dependencies: MessagingDependencies) => T,
): FactoryProvider<T> => ({
    provide,
    inject: DEPENDENCIES,
    useFactory: (...args: Parameters<typeof collect>) =>
        build(collect(...args)),
});
