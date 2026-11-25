import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

// The writes of the messages screen; the page reads the feed again after each one (decision 0036).
export abstract class MessageCommandGateway {
    abstract sendFlashMessage(
        form: FlashMessageForm,
    ): Promise<Result<null, ApiError>>;
    abstract withdrawFlashMessage(
        flashMessageId: string,
    ): Promise<Result<null, ApiError>>;
    abstract sendInstantPhoto(photo: File): Promise<Result<null, ApiError>>;
    abstract answerPhotoPrompt(
        photoPromptId: string,
        photo: File,
    ): Promise<Result<null, ApiError>>;
    abstract withdrawInstantPhoto(
        instantPhotoId: string,
    ): Promise<Result<null, ApiError>>;
}
