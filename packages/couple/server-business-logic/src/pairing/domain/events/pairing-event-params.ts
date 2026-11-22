import type { DomainEventParams } from '@cocooning/shared-kernel/domain';

export type PairingEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toDomainEventParams = <TData>(
    eventName: string,
    { coupleId, userId, occurredAt, data }: PairingEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: coupleId,
    context: { coupleId, userId },
    data,
    occurredAt,
});
