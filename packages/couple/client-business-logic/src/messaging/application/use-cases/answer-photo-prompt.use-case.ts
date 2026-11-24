import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoUpload } from '../../domain/models/instant-photo-upload';
import type { PhotoPromptGateway } from '../../domain/ports/photo-prompt.gateway';

// R8: one photo of the day per partner, until midnight in Paris, late after 10 minutes.
export class AnswerPhotoPromptUseCase {
    constructor(private readonly photoPromptGateway: PhotoPromptGateway) {}

    execute(
        photoPromptId: string,
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.photoPromptGateway.answerPhotoPrompt(photoPromptId, photo);
    }
}
