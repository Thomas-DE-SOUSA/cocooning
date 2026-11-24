import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { CursorPaginationQuery } from '@cocooning/couple-contract/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { MessageFeedGateway } from '../../domain/ports/message-feed.gateway';

// R5, R9: the words and photos of the couple, newest first, one page after the cursor (decision 0025).
export class ListMessageFeedUseCase {
    constructor(private readonly messageFeedGateway: MessageFeedGateway) {}

    execute(
        query: CursorPaginationQuery,
    ): Promise<Result<MessageFeedPageResponse, ApiError>> {
        return this.messageFeedGateway.listMessageFeed(query);
    }
}
