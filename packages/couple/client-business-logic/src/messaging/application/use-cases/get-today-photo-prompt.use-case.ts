import type { TodayPhotoPromptResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PhotoPromptGateway } from '../../domain/ports/photo-prompt.gateway';

// R7, R8: today's photo prompt once issued, photoPrompt null before; its drawn time stays secret.
export class GetTodayPhotoPromptUseCase {
    constructor(private readonly photoPromptGateway: PhotoPromptGateway) {}

    execute(): Promise<Result<TodayPhotoPromptResponse, ApiError>> {
        return this.photoPromptGateway.getTodayPhotoPrompt();
    }
}
