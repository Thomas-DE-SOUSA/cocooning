import { Injectable } from '@nestjs/common';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { EventPublisher, Logger } from '@cocooning/shared-kernel/ports';

// No in-process subscriber: the outbox relay of messaging delivers from the tables (decisions 0021, 0051), else it would notify twice.
@Injectable()
export class InProcessEventPublisher extends EventPublisher {
    constructor(private readonly logger: Logger) {
        super();
        this.logger.setContext(InProcessEventPublisher.name);
    }

    override publish(events: ReadonlyArray<DomainEvent>): Promise<void> {
        for (const event of events) {
            this.logger.debug('Event published in process', {
                eventId: event.eventId,
                eventName: event.eventName,
                aggregateId: event.aggregateId,
            });
        }
        return Promise.resolve();
    }
}
