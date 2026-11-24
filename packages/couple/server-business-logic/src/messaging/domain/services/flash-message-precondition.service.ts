import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../exceptions/messaging.exception';
import type { FlashMessage } from '../models/flash-message.aggregate';
import type { FlashMessageRepository } from '../ports/flash-message.repository';

export class FlashMessagePreconditionService {
    constructor(
        private readonly flashMessageRepository: FlashMessageRepository,
    ) {}

    // Unknown, withdrawn or of another couple, the answer is the same.
    async loadFlashMessage(
        context: ExecutionContext,
        flashMessageId: string,
    ): Promise<FlashMessage> {
        const flashMessage = await this.flashMessageRepository.findById(
            context.coupleId,
            flashMessageId,
        );
        if (flashMessage !== null) return flashMessage;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.FLASH_MESSAGE_NOT_FOUND,
            message: 'Flash message not found',
        });
    }
}
