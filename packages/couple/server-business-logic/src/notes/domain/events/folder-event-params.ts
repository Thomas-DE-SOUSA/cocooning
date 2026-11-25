import type { DomainEventParams } from '@cocooning/shared-kernel/domain';

export type FolderEventParams<TData> = {
    readonly coupleId: string;
    readonly userId: string;
    readonly folderId: string;
    readonly occurredAt: Date;
    readonly data: TData;
};

export const toFolderDomainEventParams = <TData>(
    eventName: string,
    { coupleId, userId, folderId, occurredAt, data }: FolderEventParams<TData>,
): DomainEventParams<TData> => ({
    eventName,
    aggregateId: folderId,
    context: { coupleId, userId },
    data,
    occurredAt,
});
