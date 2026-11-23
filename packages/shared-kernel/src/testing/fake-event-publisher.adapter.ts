import type { DomainEvent } from '../domain/primitives/domain-event';
import { EventPublisher } from '../ports/messaging/event-publisher';

export class FakeEventPublisherAdapter extends EventPublisher {
    private publishedEvents: ReadonlyArray<DomainEvent> = [];
    private failure: Error | null = null;

    get published(): ReadonlyArray<DomainEvent> {
        return this.publishedEvents;
    }

    failWith(error: Error): void {
        this.failure = error;
    }

    override async publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
        if (this.failure !== null) throw this.failure;
        this.publishedEvents = [...this.publishedEvents, ...events];
    }
}
