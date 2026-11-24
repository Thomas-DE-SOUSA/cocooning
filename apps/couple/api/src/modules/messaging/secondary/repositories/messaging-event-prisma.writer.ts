import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { toMessagingEventRows } from '../mappers';

type Transaction = PrismaService['current'];

// The outbox rows of a save, in the transaction of the state (decision 0021); the relay reads them later.
export async function appendMessagingEvents(
    tx: Transaction,
    aggregateId: string,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const last = await tx.messagingEvent.aggregate({
        where: { aggregateId },
        _max: { version: true },
    });
    await tx.messagingEvent.createMany({
        data: toMessagingEventRows(events, last._max.version ?? 0),
    });
}
