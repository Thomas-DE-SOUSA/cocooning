import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    MessageFeedPageResponse,
    TodayPhotoPromptResponse,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { MESSAGE_FEED_PAGE_SIZE } from '../data/message-feed-page-size';
import { messagingModule } from './messaging-module.factory';

// Read by the messages page with the session cookie of the request (decision 0036): the newest page of the feed.
export function loadFirstMessageFeedPage(): Promise<
    Result<MessageFeedPageResponse, ApiError>
> {
    return messagingModule().listMessageFeed.execute({
        cursor: null,
        limit: MESSAGE_FEED_PAGE_SIZE,
    });
}

export function loadTodayPhotoPrompt(): Promise<
    Result<TodayPhotoPromptResponse, ApiError>
> {
    return messagingModule().getTodayPhotoPrompt.execute();
}
