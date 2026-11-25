import 'server-only';
import type { ListMessageFeedUseCase } from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import { CursorPaginationQuerySchema } from '@cocooning/couple-contract/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { MESSAGE_FEED_PAGE_SIZE } from '../data/message-feed-page-size';
import { invalidInput } from './message-commands.service';

// R5: the page after the last item shown (decision 0025); the cursor comes from the browser and is validated again.
export function listOlderMessages(
    cursorInput: unknown,
    useCase: ListMessageFeedUseCase,
): Promise<Result<MessageFeedPageResponse, ApiError>> {
    const query = CursorPaginationQuerySchema.safeParse({
        cursor: cursorInput,
        limit: MESSAGE_FEED_PAGE_SIZE,
    });
    if (!query.success || query.data.cursor === null) {
        return Promise.resolve(fail(invalidInput('Invalid feed cursor')));
    }
    return useCase.execute(query.data);
}
