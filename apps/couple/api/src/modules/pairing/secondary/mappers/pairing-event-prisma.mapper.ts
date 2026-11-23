import { Prisma } from '@cocooning/couple-prisma/client';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';

const toEventData = (
    data: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull =>
    data === null
        ? Prisma.JsonNull
        : (JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue);

// Versions follow the last one stored for the aggregate, read in the same transaction (concurrency.md rule 7).
export function toPairingEventRows(
    events: ReadonlyArray<DomainEvent>,
    lastVersion: number,
): Prisma.PairingEventCreateManyInput[] {
    return events.map((event, index) => ({
        id: event.eventId,
        coupleId: event.context.coupleId,
        aggregateId: event.aggregateId,
        eventName: event.eventName,
        eventData: toEventData(event.data),
        userId: event.context.userId,
        occurredAt: event.occurredAt,
        version: lastVersion + index + 1,
    }));
}
