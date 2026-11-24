import { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import {
    DeterministicDateTimeProvider,
    FakeEventPublisherAdapter,
    FakeLoggerAdapter,
    FakeUuidV7GeneratorProvider,
    InMemoryFileStorage,
} from '@cocooning/shared-kernel/testing';
import { FlashMessage } from '../../domain/models/flash-message.aggregate';
import { InstantPhoto } from '../../domain/models/instant-photo.aggregate';
import { FlashMessagePreconditionService } from '../../domain/services/flash-message-precondition.service';
import { InstantPhotoPreconditionService } from '../../domain/services/instant-photo-precondition.service';
import { MessageFeedService } from '../../domain/services/message-feed.service';
import { FlashMessageText } from '../../domain/value-objects/flash-message-text.vo';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { InstantPhotoContent } from '../../domain/value-objects/instant-photo-content.vo';
import { FakePairedCoupleProvider } from '../secondary/adapters/fake-paired-couple.provider';
import { FlashMessageInMemoryRepository } from '../secondary/adapters/flash-message-in-memory.repository';
import { InstantPhotoInMemoryRepository } from '../secondary/adapters/instant-photo-in-memory.repository';
import {
    JPEG_PHOTO,
    LOVE,
    MILLISECONDS_PER_HOUR,
    NOW,
} from './messaging-test.data';

// The fakes of the messages and the given steps; MessagingTestContext adds the use cases.
export class MessagingTestFakes {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly flashMessageRepository = new FlashMessageInMemoryRepository();
    readonly instantPhotoRepository = new InstantPhotoInMemoryRepository();
    readonly fileStorage = new InMemoryFileStorage();
    readonly pairedCoupleProvider = new FakePairedCoupleProvider();
    readonly eventPublisher = new FakeEventPublisherAdapter();
    readonly logger = new FakeLoggerAdapter();
    protected readonly eventPublishingService = new EventPublishingService(
        this.eventPublisher,
        this.logger,
    );
    protected readonly flashMessagePreconditions =
        new FlashMessagePreconditionService(this.flashMessageRepository);
    protected readonly instantPhotoPreconditions =
        new InstantPhotoPreconditionService(
            this.instantPhotoRepository,
            this.fileStorage,
        );
    protected readonly messageFeedService = new MessageFeedService(
        this.flashMessageRepository,
        this.instantPhotoRepository,
    );

    constructor() {
        FlashMessageId.configure(new FakeUuidV7GeneratorProvider());
    }

    // A flash message of the couple, as if already in the database, without events.
    givenFlashMessageOf(context: ExecutionContext, text = LOVE): FlashMessage {
        const flashMessage = FlashMessage.send(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                text: FlashMessageText.create(text),
            },
            this.dateTimeProvider.now(),
        );
        flashMessage.clearDomainEvents();
        this.flashMessageRepository.seed(flashMessage);
        return flashMessage;
    }

    // An instant photo of the couple and its file, as if already stored, without events.
    async givenInstantPhotoOf(
        context: ExecutionContext,
        bytes = JPEG_PHOTO,
    ): Promise<InstantPhoto> {
        const content = InstantPhotoContent.create(bytes);
        const instantPhoto = InstantPhoto.send(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                contentType: content.contentType,
            },
            this.dateTimeProvider.now(),
        );
        instantPhoto.clearDomainEvents();
        this.instantPhotoRepository.seed(instantPhoto);
        await this.fileStorage.store({
            key: instantPhoto.fileKey,
            content: bytes,
            contentType: content.contentType,
        });
        return instantPhoto;
    }

    advanceHours(hours: number): void {
        this.dateTimeProvider.advanceBy(hours * MILLISECONDS_PER_HOUR);
    }
}
