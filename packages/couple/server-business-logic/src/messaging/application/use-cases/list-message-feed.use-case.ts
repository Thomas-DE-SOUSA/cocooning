import type {
    CursorPaginationParams,
    ExecutionContext,
} from '@cocooning/shared-kernel/domain';
import type { MessageFeedService } from '../../domain/services/message-feed.service';
import {
    type MessageFeedPageView,
    toMessageFeedPageView,
} from '../mappers/message-feed-page-view.mapper';

export type ListMessageFeedCommand = CursorPaginationParams;

export class ListMessageFeedUseCase {
    constructor(private readonly messageFeedService: MessageFeedService) {}

    // R5: the flash messages and instant photos of the couple, newest first, one page after the cursor.
    async execute(
        context: ExecutionContext,
        command: ListMessageFeedCommand,
    ): Promise<MessageFeedPageView> {
        const page = await this.messageFeedService.readPage(
            context.coupleId,
            command,
        );
        return toMessageFeedPageView(page, context.userId);
    }
}
