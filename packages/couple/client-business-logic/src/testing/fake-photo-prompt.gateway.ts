import type {
    MessageFeedItemResponse,
    TodayPhotoPromptResponse,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { InstantPhotoUpload } from '../messaging/domain/models/instant-photo-upload';
import { PhotoPromptGateway } from '../messaging/domain/ports/photo-prompt.gateway';
import type { ApiError } from '../shared/api-error';
import { AN_INSTANT_PHOTO, A_TODAY_PHOTO_PROMPT } from './messaging-fixtures';

export type PhotoPromptGatewayCall =
    | { readonly operation: 'getTodayPhotoPrompt' }
    | {
          readonly operation: 'answerPhotoPrompt';
          readonly photoPromptId: string;
          readonly photo: InstantPhotoUpload;
      };

// Today's photo prompt and the photo of the day answer every call, or one refusal does.
export class FakePhotoPromptGateway extends PhotoPromptGateway {
    readonly calls: PhotoPromptGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override getTodayPhotoPrompt(): Promise<
        Result<TodayPhotoPromptResponse, ApiError>
    > {
        return this.respond(
            { operation: 'getTodayPhotoPrompt' },
            A_TODAY_PHOTO_PROMPT,
        );
    }

    override answerPhotoPrompt(
        photoPromptId: string,
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.respond(
            { operation: 'answerPhotoPrompt', photoPromptId, photo },
            { ...AN_INSTANT_PHOTO, photoPromptId },
        );
    }

    private respond<T>(
        call: PhotoPromptGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
