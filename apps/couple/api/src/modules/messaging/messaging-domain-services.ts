import {
    FlashMessagePreconditionService,
    type FlashMessageRepository,
    InstantPhotoPreconditionService,
    type InstantPhotoRepository,
    MessageFeedService,
    PhotoOfTheDayService,
    PhotoPromptPreconditionService,
    type PhotoPromptRepository,
    PhotoPromptScheduleService,
} from '@cocooning/couple-server-business-logic/messaging';
import type {
    FileStorage,
    SecureRandomGenerator,
} from '@cocooning/shared-kernel/ports';

type MessagingPorts = {
    readonly flashMessages: FlashMessageRepository;
    readonly instantPhotos: InstantPhotoRepository;
    readonly photoPrompts: PhotoPromptRepository;
    readonly fileStorage: FileStorage;
    readonly random: SecureRandomGenerator;
};

// Domain services are created inline, never providers (decision 0005).
export const messagingDomainServicesOf = ({
    flashMessages,
    instantPhotos,
    photoPrompts,
    fileStorage,
    random,
}: MessagingPorts) => ({
    flashMessagePreconditions: new FlashMessagePreconditionService(
        flashMessages,
    ),
    instantPhotoPreconditions: new InstantPhotoPreconditionService(
        instantPhotos,
        fileStorage,
    ),
    photoPromptPreconditions: new PhotoPromptPreconditionService(
        photoPrompts,
        instantPhotos,
    ),
    photoPromptSchedule: new PhotoPromptScheduleService(photoPrompts, random),
    photoOfTheDay: new PhotoOfTheDayService(photoPrompts, instantPhotos),
    feed: new MessageFeedService(flashMessages, instantPhotos),
});
