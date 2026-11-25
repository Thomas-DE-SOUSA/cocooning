import type { DomainEventParams } from '@cocooning/shared-kernel/domain';

export type NoteCardEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly noteCardId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toNoteCardDomainEventParams = <TData>(
    eventName: string,
    {
        coupleId,
        userId,
        noteCardId,
        occurredAt,
        data,
    }: NoteCardEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: noteCardId,
    context: { coupleId, userId },
    data,
    occurredAt,
});
