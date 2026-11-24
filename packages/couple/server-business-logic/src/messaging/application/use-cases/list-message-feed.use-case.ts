import type {
    CursorPaginationParams,
    ExecutionContext,
} from '@cocooning/shared-kernel/domain';
import type { MessageFeedService } from '../../domain/services/message-feed.service';
import type { PhotoOfTheDayService } from '../../domain/services/photo-of-the-day.service';
import {
    type MessageFeedPageView,
    toMessageFeedPageView,
} from '../mappers/message-feed-page-view.mapper';

export type ListMessageFeedCommand = CursorPaginationParams;

export class ListMessageFeedUseCase {
    constructor(
        private readonly messageFeedService: MessageFeedService,
        private readonly photoOfTheDayService: PhotoOfTheDayService,
    ) {}

    // R5: the flash messages and instant photos of the couple, newest first, one page after the cursor.
    // R9: the partner's photo of the day is hidden from a reader who has not answered its prompt.
    async execute(
        context: ExecutionContext,
        command: ListMessageFeedCommand,
    ): Promise<MessageFeedPageView> {
        const page = await this.messageFeedService.readPage(
            context.coupleId,
            command,
        );
        const answered = await this.photoOfTheDayService.answeredBy(
            context,
            page.items,
        );
        return toMessageFeedPageView(page, context.userId, answered);
    }
}
