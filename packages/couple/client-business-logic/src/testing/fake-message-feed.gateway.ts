import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { CursorPaginationQuery } from '@cocooning/couple-contract/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { MessageFeedGateway } from '../messaging/domain/ports/message-feed.gateway';
import type { ApiError } from '../shared/api-error';
import { A_MESSAGE_FEED_PAGE } from './messaging-fixtures';

// One page answers every call, or one refusal does.
export class FakeMessageFeedGateway extends MessageFeedGateway {
    readonly queries: CursorPaginationQuery[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override listMessageFeed(
        query: CursorPaginationQuery,
    ): Promise<Result<MessageFeedPageResponse, ApiError>> {
        this.queries.push(query);
        return Promise.resolve(
            this.refusal === null
                ? ok(A_MESSAGE_FEED_PAGE)
                : fail(this.refusal),
        );
    }
}
