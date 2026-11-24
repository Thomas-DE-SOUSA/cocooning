import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { toMessagingEventRows } from '../mappers';

type Transaction = PrismaService['current'];

// The outbox rows of a save, in the transaction of the state (decision 0021); one read and one write for any number of aggregates.
export async function appendMessagingEvents(
    tx: Transaction,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const lasts = await tx.messagingEvent.groupBy({
        by: ['aggregateId'],
        where: {
            aggregateId: { in: [...new Set(events.map((e) => e.aggregateId))] },
        },
        _max: { version: true },
    });
    const lastVersions = new Map(
        lasts.map(({ aggregateId, _max }) => [aggregateId, _max.version ?? 0]),
    );
    await tx.messagingEvent.createMany({
        data: toMessagingEventRows(events, lastVersions),
    });
}
