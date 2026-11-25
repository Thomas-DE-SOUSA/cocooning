import type {
    MessageFeedItemResponse,
    SendFlashMessageRequest,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

export abstract class FlashMessageGateway {
    abstract sendFlashMessage(
        request: SendFlashMessageRequest,
    ): Promise<Result<MessageFeedItemResponse, ApiError>>;
    abstract withdrawFlashMessage(
        flashMessageId: string,
    ): Promise<Result<null, ApiError>>;
}
