import type {
    MessageFeedItemResponse,
    SendFlashMessageRequest,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { FlashMessageGateway } from '../messaging/domain/ports/flash-message.gateway';
import type { ApiError } from '../shared/api-error';
import { A_FLASH_MESSAGE } from './messaging-fixtures';

export type FlashMessageGatewayCall =
    | {
          readonly operation: 'sendFlashMessage';
          readonly request: SendFlashMessageRequest;
      }
    | {
          readonly operation: 'withdrawFlashMessage';
          readonly flashMessageId: string;
      };

// The sent word comes back with its text, or one refusal answers every call.
export class FakeFlashMessageGateway extends FlashMessageGateway {
    readonly calls: FlashMessageGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override sendFlashMessage(
        request: SendFlashMessageRequest,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.respond(
            { operation: 'sendFlashMessage', request },
            { ...A_FLASH_MESSAGE, text: request.text },
        );
    }

    override withdrawFlashMessage(
        flashMessageId: string,
    ): Promise<Result<null, ApiError>> {
        return this.respond(
            { operation: 'withdrawFlashMessage', flashMessageId },
            null,
        );
    }

    private respond<T>(
        call: FlashMessageGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
