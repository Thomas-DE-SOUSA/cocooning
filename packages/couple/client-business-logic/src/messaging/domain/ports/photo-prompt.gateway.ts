import type {
    MessageFeedItemResponse,
    TodayPhotoPromptResponse,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoUpload } from '../models/instant-photo-upload';

// R7, R8: the photo of the day.
export abstract class PhotoPromptGateway {
    abstract getTodayPhotoPrompt(): Promise<
        Result<TodayPhotoPromptResponse, ApiError>
    >;
    abstract answerPhotoPrompt(
        photoPromptId: string,
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>>;
}
