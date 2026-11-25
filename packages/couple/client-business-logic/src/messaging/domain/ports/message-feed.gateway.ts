import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { CursorPaginationQuery } from '@cocooning/couple-contract/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// Every messaging port acts for the signed-in partner: the adapter forwards the session (decision 0036), the API finds the couple (decision 0041).
export abstract class MessageFeedGateway {
    abstract listMessageFeed(
        query: CursorPaginationQuery,
    ): Promise<Result<MessageFeedPageResponse, ApiError>>;
}
