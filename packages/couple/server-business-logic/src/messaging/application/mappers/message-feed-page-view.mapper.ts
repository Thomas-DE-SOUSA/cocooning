import type { CursorPage } from '@cocooning/shared-kernel/domain';
import type { MessageFeedPage } from '../../domain/models/message-feed-item';
import type { AnsweredPhotoPrompts } from '../../domain/models/photo-of-the-day';
import {
    type MessageFeedItemView,
    toMessageFeedItemView,
} from './message-feed-item-view.mapper';

export type MessageFeedPageView = CursorPage<MessageFeedItemView>;

export const toMessageFeedPageView = (
    page: MessageFeedPage,
    readerId: string,
    answered: AnsweredPhotoPrompts,
): MessageFeedPageView => ({
    items: page.items.map((item) =>
        toMessageFeedItemView(item, readerId, answered),
    ),
    nextCursor: page.nextCursor,
});
