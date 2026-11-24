import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { toNoteEventRows } from '../mappers';

type Transaction = PrismaService['current'];

// The outbox rows of a save, in the transaction of the state (decision 0021); the relay reads them later.
export async function appendNoteEvents(
    tx: Transaction,
    aggregateId: string,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const last = await tx.noteEvent.aggregate({
        where: { aggregateId },
        _max: { version: true },
    });
    await tx.noteEvent.createMany({
        data: toNoteEventRows(events, last._max.version ?? 0),
    });
}
