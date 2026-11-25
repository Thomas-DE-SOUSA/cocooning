import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../exceptions/messaging.exception';
import type { PhotoPrompt } from '../models/photo-prompt.aggregate';
import type { InstantPhotoRepository } from '../ports/instant-photo.repository';
import type { PhotoPromptRepository } from '../ports/photo-prompt.repository';

export class PhotoPromptPreconditionService {
    constructor(
        private readonly photoPromptRepository: PhotoPromptRepository,
        private readonly instantPhotoRepository: InstantPhotoRepository,
    ) {}

    // Unknown or of another couple, the answer is the same; a prompt not issued yet is refused by the aggregate.
    async loadPhotoPrompt(
        context: ExecutionContext,
        photoPromptId: string,
    ): Promise<PhotoPrompt> {
        const photoPrompt = await this.photoPromptRepository.findById(
            context.coupleId,
            photoPromptId,
        );
        if (photoPrompt !== null) return photoPrompt;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
            message: 'Photo prompt not found',
        });
    }

    // R8: one photo of the day per partner; a withdrawn one no longer counts.
    async ensureNotAnsweredBy(
        context: ExecutionContext,
        photoPrompt: PhotoPrompt,
    ): Promise<void> {
        const photosOfTheDay =
            await this.instantPhotoRepository.findOfPhotoPrompts(
                context.coupleId,
                [photoPrompt.id.getValue()],
            );
        if (!photosOfTheDay.some(({ ownerId }) => ownerId === context.userId))
            return;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
            message: 'Photo of the day already sent',
        });
    }
}
