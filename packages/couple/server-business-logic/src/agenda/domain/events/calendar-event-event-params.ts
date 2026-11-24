import type {
    DomainEvent,
    DomainEventParams,
    Uuid,
} from '@cocooning/shared-kernel/domain';

export type CalendarEventEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly calendarEventId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toDomainEventParams = <TData>(
    eventName: string,
    {
        coupleId,
        userId,
        calendarEventId,
        occurredAt,
        data,
    }: CalendarEventEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: calendarEventId,
    context: { coupleId, userId },
    data,
    occurredAt,
});

// A fact about the event with no data of its own: edited, shared, made private, deleted.
export type CalendarEventFactClass = new (
    params: CalendarEventEventParams<null>,
) => DomainEvent;

export const eventParamsOf = <TData>(
    calendarEvent: { readonly coupleId: string; readonly id: Uuid },
    userId: string,
    occurredAt: Date,
    data: TData,
): CalendarEventEventParams<TData> => ({
    coupleId: calendarEvent.coupleId,
    userId,
    calendarEventId: calendarEvent.id.getValue(),
    occurredAt,
    data,
});
