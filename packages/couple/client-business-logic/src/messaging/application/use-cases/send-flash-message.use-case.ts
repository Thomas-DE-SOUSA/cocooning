import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { FlashMessageGateway } from '../../domain/ports/flash-message.gateway';
import type { FlashMessageForm } from '../schemas/flash-message-form.zod';

// R1, R2: a word of the couple, typed or ready-made, owned by its author.
export class SendFlashMessageUseCase {
    constructor(private readonly flashMessageGateway: FlashMessageGateway) {}

    execute(
        form: FlashMessageForm,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.flashMessageGateway.sendFlashMessage({ text: form.text });
    }
}
