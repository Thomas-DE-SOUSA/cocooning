import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { toAgendaEventRows } from '../mappers';

type Transaction = PrismaService['current'];

// The outbox rows of a save, in the transaction of the state (decision 0021); the relay reads them later.
export async function appendAgendaEvents(
    tx: Transaction,
    aggregateId: string,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const last = await tx.agendaEvent.aggregate({
        where: { aggregateId },
        _max: { version: true },
    });
    await tx.agendaEvent.createMany({
        data: toAgendaEventRows(events, last._max.version ?? 0),
    });
}
