import type {
    MessageFeedItemResponse,
    MessageFeedPageResponse,
} from '@cocooning/couple-contract/messaging';
import type {
    MessageFeedItemView,
    MessageFeedPageView,
} from '@cocooning/couple-server-business-logic/messaging';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toMessageFeedItemResponse = (
    view: MessageFeedItemView,
): MessageFeedItemResponse => ({
    ...view,
    sentAt: view.sentAt.toISOString(),
});

export const toMessageFeedPageResponse = (
    page: MessageFeedPageView,
): MessageFeedPageResponse => ({
    items: page.items.map(toMessageFeedItemResponse),
    nextCursor: page.nextCursor,
});
