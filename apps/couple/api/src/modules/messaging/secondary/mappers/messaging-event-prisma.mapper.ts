import { Prisma } from '@cocooning/couple-prisma/client';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';

const toEventData = (
    data: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull =>
    data === null
        ? Prisma.JsonNull
        : (JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue);

const toRow = (
    event: DomainEvent,
    version: number,
): Prisma.MessagingEventCreateManyInput => ({
    id: event.eventId,
    coupleId: event.context.coupleId,
    aggregateId: event.aggregateId,
    eventName: event.eventName,
    eventData: toEventData(event.data),
    userId: event.context.userId,
    occurredAt: event.occurredAt,
    version,
});

// Each aggregate's events follow the last version stored for it, read in the same transaction (concurrency.md rule 7).
export function toMessagingEventRows(
    events: ReadonlyArray<DomainEvent>,
    lastVersions: ReadonlyMap<string, number>,
): Prisma.MessagingEventCreateManyInput[] {
    return events.map((event, index) => {
        const earlier = events
            .slice(0, index)
            .filter(({ aggregateId }) => aggregateId === event.aggregateId);
        const last = lastVersions.get(event.aggregateId) ?? 0;
        return toRow(event, last + earlier.length + 1);
    });
}
