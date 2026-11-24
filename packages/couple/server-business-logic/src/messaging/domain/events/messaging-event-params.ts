import type {
    DomainEvent,
    DomainEventParams,
    Uuid,
} from '@cocooning/shared-kernel/domain';

export type MessagingEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly aggregateId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toDomainEventParams = <TData>(
    eventName: string,
    {
        coupleId,
        userId,
        aggregateId,
        occurredAt,
        data,
    }: MessagingEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId,
    context: { coupleId, userId },
    data,
    occurredAt,
});

// A fact about a flash message or an instant photo with no data of its own: withdrawn.
export type MessagingFactClass = new (
    params: MessagingEventParams<null>,
) => DomainEvent;

export const eventParamsOf = <TData>(
    message: { readonly coupleId: string; readonly id: Uuid },
    userId: string,
    occurredAt: Date,
    data: TData,
): MessagingEventParams<TData> => ({
    coupleId: message.coupleId,
    userId,
    aggregateId: message.id.getValue(),
    occurredAt,
    data,
});
