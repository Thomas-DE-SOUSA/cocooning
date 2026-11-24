import type { OutboxEvent } from '../../../domain/models/outbox-event';
import { OutboxEventRepository } from '../../../domain/ports/outbox-event.repository';

export type PublishedOutboxEvent = {
    readonly eventId: string;
    readonly publishedAt: Date;
};

// The three outboxes as one queue in occurrence order: what is pending, what was marked published and when.
export class OutboxEventInMemoryRepository extends OutboxEventRepository {
    private pending: ReadonlyArray<OutboxEvent> = [];
    private published: ReadonlyArray<PublishedOutboxEvent> = [];

    get pendingEvents(): ReadonlyArray<OutboxEvent> {
        return this.pending;
    }

    get publishedEvents(): ReadonlyArray<PublishedOutboxEvent> {
        return this.published;
    }

    givenPending(events: ReadonlyArray<OutboxEvent>): void {
        this.pending = [...this.pending, ...events];
    }

    override claimPending(limit: number): Promise<ReadonlyArray<OutboxEvent>> {
        return Promise.resolve(this.pending.slice(0, limit));
    }

    override markPublished(
        events: ReadonlyArray<OutboxEvent>,
        publishedAt: Date,
    ): Promise<void> {
        const ids = events.map(({ eventId }) => eventId);
        this.pending = this.pending.filter(
            ({ eventId }) => !ids.includes(eventId),
        );
        this.published = [
            ...this.published,
            ...ids.map((eventId) => ({ eventId, publishedAt })),
        ];
        return Promise.resolve();
    }
}
