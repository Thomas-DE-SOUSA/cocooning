import type { DomainEventParams } from '@cocooning/shared-kernel/domain';

export type CalendarLabelEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly calendarLabelId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toCalendarLabelDomainEventParams = <TData>(
    eventName: string,
    {
        coupleId,
        userId,
        calendarLabelId,
        occurredAt,
        data,
    }: CalendarLabelEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: calendarLabelId,
    context: { coupleId, userId },
    data,
    occurredAt,
});
