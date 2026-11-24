import type { z } from 'zod';
import { createCursorPageResponseSchema } from '../../shared/cursor-page.zod';
import { MessageFeedItemResponseSchema } from './message-feed-item.zod';

// R5: newest first; nextCursor is the id of the last item, null on the last page (decision 0025).
export const MessageFeedPageResponseSchema = createCursorPageResponseSchema(
    MessageFeedItemResponseSchema,
);

export type MessageFeedPageResponse = z.infer<
    typeof MessageFeedPageResponseSchema
>;
