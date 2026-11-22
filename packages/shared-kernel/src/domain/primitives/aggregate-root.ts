import type { DomainEvent } from './domain-event';

export abstract class AggregateRoot {
    private domainEvents: DomainEvent[] = [];

    protected addDomainEvent(event: DomainEvent): void {
        this.domainEvents = [...this.domainEvents, event];
    }

    getDomainEvents(): ReadonlyArray<DomainEvent> {
        return Object.freeze([...this.domainEvents]);
    }

    clearDomainEvents(): void {
        this.domainEvents = [];
    }

    hasUncommittedEvents(): boolean {
        return this.domainEvents.length > 0;
    }
}
