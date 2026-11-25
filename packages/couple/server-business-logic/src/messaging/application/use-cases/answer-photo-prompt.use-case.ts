import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    FileStorage,
} from '@cocooning/shared-kernel/ports';
import { InstantPhoto } from '../../domain/models/instant-photo.aggregate';
import { NO_PHOTO_PROMPT_ANSWERED } from '../../domain/models/photo-of-the-day';
import type { InstantPhotoRepository } from '../../domain/ports/instant-photo.repository';
import type { PhotoPromptPreconditionService } from '../../domain/services/photo-prompt-precondition.service';
import { InstantPhotoContent } from '../../domain/value-objects/instant-photo-content.vo';
import {
    type InstantPhotoView,
    toInstantPhotoView,
} from '../mappers/message-feed-item-view.mapper';

export type AnswerPhotoPromptCommand = {
    readonly photoPromptId: string;
    readonly content: Uint8Array;
};

export class AnswerPhotoPromptUseCase {
    constructor(
        private readonly instantPhotoRepository: InstantPhotoRepository,
        private readonly photoPromptPreconditionService: PhotoPromptPreconditionService,
        private readonly fileStorage: FileStorage,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    // R8: the photo of the day, once per partner, until midnight; the file is stored before the row, as for a spontaneous photo.
    async execute(
        context: ExecutionContext,
        command: AnswerPhotoPromptCommand,
    ): Promise<InstantPhotoView> {
        const photoPrompt =
            await this.photoPromptPreconditionService.loadPhotoPrompt(
                context,
                command.photoPromptId,
            );
        await this.photoPromptPreconditionService.ensureNotAnsweredBy(
            context,
            photoPrompt,
        );
        const content = InstantPhotoContent.create(command.content);
        const now = this.dateTimeProvider.now();
        const instantPhoto = InstantPhoto.answer(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                contentType: content.contentType,
            },
            photoPrompt.answerAt(now),
            now,
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
