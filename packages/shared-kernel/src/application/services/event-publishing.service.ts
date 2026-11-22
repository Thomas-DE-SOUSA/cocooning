import type { DomainEvent } from '../../domain/primitives/domain-event';
import type { Logger } from '../../ports/logging/logger';
import type { EventPublisher } from '../../ports/messaging/event-publisher';

type EventEmittingAggregate = {
    getDomainEvents(): ReadonlyArray<DomainEvent>;
    clearDomainEvents(): void;
};

// Publishes in process after commit and never marks an event published: only the outbox relay does (decision 0021).
export class EventPublishingService {
    constructor(
        private readonly eventPublisher: EventPublisher,
        private readonly logger: Logger,
    ) {}

    async publishAndClear(
        aggregates: ReadonlyArray<EventEmittingAggregate>,
    ): Promise<void> {
        const events = aggregates.flatMap((aggregate) =>
            aggregate.getDomainEvents(),
        );
        aggregates.forEach((aggregate) => aggregate.clearDomainEvents());
        if (events.length === 0) return;
        try {
            await this.eventPublisher.publish(events);
        } catch (error) {
            this.logger.warn(
                'In-process event publication failed, the outbox relay will deliver',
                {
                    eventIds: events.map((event) => event.eventId),
                    error,
                },
            );
        }
    }
}
