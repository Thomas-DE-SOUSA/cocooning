import type { DomainEventParams } from '@cocooning/shared-kernel/domain';

export type NoteEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly noteId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toDomainEventParams = <TData>(
    eventName: string,
    { coupleId, userId, noteId, occurredAt, data }: NoteEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: noteId,
    context: { coupleId, userId },
    data,
    occurredAt,
});
