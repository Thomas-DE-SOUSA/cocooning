import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    FileStorage,
} from '@cocooning/shared-kernel/ports';
import { InstantPhoto } from '../../domain/models/instant-photo.aggregate';
import { NO_PHOTO_PROMPT_ANSWERED } from '../../domain/models/photo-of-the-day';
import type { InstantPhotoRepository } from '../../domain/ports/instant-photo.repository';
import { InstantPhotoContent } from '../../domain/value-objects/instant-photo-content.vo';
import {
    type InstantPhotoView,
    toInstantPhotoView,
} from '../mappers/message-feed-item-view.mapper';

export type SendInstantPhotoCommand = {
    readonly content: Uint8Array;
};

export class SendInstantPhotoUseCase {
    constructor(
        private readonly instantPhotoRepository: InstantPhotoRepository,
        private readonly fileStorage: FileStorage,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    // The file is stored before the row: a failed save leaves an unread file, never a photo without its bytes.
    async execute(
        context: ExecutionContext,
        command: SendInstantPhotoCommand,
    ): Promise<InstantPhotoView> {
        const content = InstantPhotoContent.create(command.content);
        const instantPhoto = InstantPhoto.send(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                contentType: content.contentType,
            },
            this.dateTimeProvider.now(),
        );
        await this.fileStorage.store({
            key: instantPhoto.fileKey,
            content: content.bytes,
            contentType: content.contentType,
        });
        await this.instantPhotoRepository.save(instantPhoto);
        await this.eventPublishingService.publishAndClear([instantPhoto]);
        return toInstantPhotoView(
            instantPhoto,
            context.userId,
            NO_PHOTO_PROMPT_ANSWERED,
        );
    }
}
