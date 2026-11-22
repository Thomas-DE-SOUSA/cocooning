import type { ExecutionContext } from '../types/execution-context';
import { EventId } from '../value-objects/event-id.vo';

export interface DomainEvent<TData = unknown> {
    readonly eventId: string;
    readonly eventName: string;
    readonly aggregateId: string;
    readonly context: ExecutionContext;
    readonly data: TData;
    readonly occurredAt: Date;
}

export type DomainEventParams<TData> = Omit<DomainEvent<TData>, 'eventId'>;

export abstract class DomainEventBase<
    TData = unknown,
> implements DomainEvent<TData> {
    readonly eventId: string;
    readonly eventName: string;
    readonly aggregateId: string;
    readonly context: ExecutionContext;
    readonly data: TData;
    readonly occurredAt: Date;

    protected constructor({
        eventName,
        aggregateId,
        context,
        data,
        occurredAt,
    }: DomainEventParams<TData>) {
        this.eventId = EventId.generate().getValue();
        this.eventName = eventName;
        this.aggregateId = aggregateId;
        this.context = context;
        this.data = data;
        this.occurredAt = new Date(occurredAt.getTime());
    }
}
