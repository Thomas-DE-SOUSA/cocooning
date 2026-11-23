import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { toPairingEventRows } from '../mappers';

type Transaction = PrismaService['current'];

// The outbox rows of a save, in the transaction of the state (decision 0021); the relay reads them later.
export async function appendPairingEvents(
    tx: Transaction,
    aggregateId: string,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const last = await tx.pairingEvent.aggregate({
        where: { aggregateId },
        _max: { version: true },
    });
    await tx.pairingEvent.createMany({
        data: toPairingEventRows(events, last._max.version ?? 0),
    });
}
