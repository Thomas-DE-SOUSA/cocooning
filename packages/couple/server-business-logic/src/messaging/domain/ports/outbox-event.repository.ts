import type { OutboxEvent } from '../models/outbox-event';

// The outboxes of notes, agenda and messaging, read by the relay of the API (decision 0021).
export abstract class OutboxEventRepository {
    // R10: the relay's only read across couples. The oldest unpublished events, in occurrence order, held by the
    // running transaction so that a second relay skips them.
    abstract claimPending(limit: number): Promise<ReadonlyArray<OutboxEvent>>;
    // Every claimed event, notifying or not, once its notifications were attempted.
    abstract markPublished(
        events: ReadonlyArray<OutboxEvent>,
        publishedAt: Date,
    ): Promise<void>;
}
