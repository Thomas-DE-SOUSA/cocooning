import type { DomainEvent } from '../../domain/primitives/domain-event';

export abstract class EventPublisher {
    abstract publish(events: ReadonlyArray<DomainEvent>): Promise<void>;
}
