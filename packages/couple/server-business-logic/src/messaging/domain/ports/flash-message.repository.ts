import type { FlashMessage } from '../models/flash-message.aggregate';

// A withdrawn flash message is filtered by the query, never in memory (core-backend.md rule 12).
export abstract class FlashMessageRepository {
    abstract save(flashMessage: FlashMessage): Promise<void>;
    abstract findById(
        coupleId: string,
        flashMessageId: string,
    ): Promise<FlashMessage | null>;
    // Decision 0025: at most `count` live flash messages, newest first, older than the id `before` when given.
    abstract findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): Promise<ReadonlyArray<FlashMessage>>;
}
