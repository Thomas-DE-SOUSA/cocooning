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

// The outbox rows of several aggregates in one read of their last versions and one insert (core.md rule 9).
export async function appendNoteEventsOfMany(
    tx: Transaction,
    events: ReadonlyArray<DomainEvent>,
): Promise<void> {
    if (events.length === 0) return;
    const aggregateIds = [...new Set(events.map((event) => event.aggregateId))];
    const lasts = await tx.noteEvent.groupBy({
        by: ['aggregateId'],
        where: { aggregateId: { in: aggregateIds } },
        _max: { version: true },
    });
    await tx.noteEvent.createMany({
        data: aggregateIds.flatMap((aggregateId) =>
            toNoteEventRows(
                events.filter((event) => event.aggregateId === aggregateId),
                lasts.find((last) => last.aggregateId === aggregateId)?._max
                    .version ?? 0,
            ),
        ),
    });
}
