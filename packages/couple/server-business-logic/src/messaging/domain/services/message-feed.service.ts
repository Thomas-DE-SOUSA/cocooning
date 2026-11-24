import type { CursorPaginationParams } from '@cocooning/shared-kernel/domain';
import type {
    MessageFeedItem,
    MessageFeedPage,
} from '../models/message-feed-item';
import type { FlashMessageRepository } from '../ports/flash-message.repository';
import type { InstantPhotoRepository } from '../ports/instant-photo.repository';

// UUID v7 follows the order of creation (decision 0025): the greater id is the newer item.
const newestFirst = (left: MessageFeedItem, right: MessageFeedItem): number =>
    left.id.getValue() < right.id.getValue() ? 1 : -1;

// The cursor of the next page: the id of the last item received (decision 0025).
const lastIdOf = (items: ReadonlyArray<MessageFeedItem>): string | null =>
    items.reduce<string | null>((_last, item) => item.id.getValue(), null);

export class MessageFeedService {
    constructor(
        private readonly flashMessageRepository: FlashMessageRepository,
        private readonly instantPhotoRepository: InstantPhotoRepository,
    ) {}

    // R5: one query per kind, one more item than the page to know whether another follows (core.md rule 9).
    async readPage(
        coupleId: string,
        { cursor, limit }: CursorPaginationParams,
    ): Promise<MessageFeedPage> {
        const [flashMessages, instantPhotos] = await Promise.all([
            this.flashMessageRepository.findNewest(coupleId, cursor, limit + 1),
            this.instantPhotoRepository.findNewest(coupleId, cursor, limit + 1),
        ]);
        const newest = [...flashMessages, ...instantPhotos].sort(newestFirst);
        const items = newest.slice(0, limit);
        return {
            items,
            nextCursor: newest.length > limit ? lastIdOf(items) : null,
        };
    }
}
