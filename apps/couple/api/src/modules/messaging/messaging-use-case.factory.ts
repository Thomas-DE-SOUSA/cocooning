import type { FactoryProvider, Type } from '@nestjs/common';
import {
    type FlashMessagePreconditionService,
    FlashMessageRepository,
    type InstantPhotoPreconditionService,
    InstantPhotoRepository,
    type MessageFeedService,
    PairedCoupleProvider,
    type PhotoOfTheDayService,
    type PhotoPromptPreconditionService,
    PhotoPromptRepository,
    type PhotoPromptScheduleService,
} from '@cocooning/couple-server-business-logic/messaging';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    FileStorage,
    Logger,
    SecureRandomGenerator,
} from '@cocooning/shared-kernel/ports';
import { messagingDomainServicesOf } from './messaging-domain-services';

export type MessagingDependencies = {
    readonly flashMessages: FlashMessageRepository;
    readonly instantPhotos: InstantPhotoRepository;
    readonly photoPrompts: PhotoPromptRepository;
    readonly pairedCouples: PairedCoupleProvider;
    readonly fileStorage: FileStorage;
    readonly flashMessagePreconditions: FlashMessagePreconditionService;
    readonly instantPhotoPreconditions: InstantPhotoPreconditionService;
    readonly photoPromptPreconditions: PhotoPromptPreconditionService;
    readonly photoPromptSchedule: PhotoPromptScheduleService;
    readonly photoOfTheDay: PhotoOfTheDayService;
    readonly feed: MessageFeedService;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    FlashMessageRepository,
    InstantPhotoRepository,
    PhotoPromptRepository,
    PairedCoupleProvider,
    FileStorage,
    SecureRandomGenerator,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

const collect = (
    flashMessages: FlashMessageRepository,
    instantPhotos: InstantPhotoRepository,
    photoPrompts: PhotoPromptRepository,
    pairedCouples: PairedCoupleProvider,
    fileStorage: FileStorage,
    random: SecureRandomGenerator,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): MessagingDependencies => {
    logger.setContext(EventPublishingService.name);
    const ports = {
        flashMessages,
        instantPhotos,
        photoPrompts,
        pairedCouples,
        fileStorage,
        random,
        clock,
    };
    return {
        flashMessages,
        instantPhotos,
        photoPrompts,
        pairedCouples,
        fileStorage,
        clock,
        ...messagingDomainServicesOf(ports),
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
