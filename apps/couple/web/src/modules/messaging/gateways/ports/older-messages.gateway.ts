import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';

// R5: the page of the feed after the given cursor, read when the partner asks for older messages.
export abstract class OlderMessagesGateway {
    abstract listOlderMessages(
        cursor: string,
    ): Promise<Result<MessageFeedPageResponse, ApiError>>;
}
