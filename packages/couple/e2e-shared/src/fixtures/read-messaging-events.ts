import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { OutboxEventRow } from './read-pairing-events';

// The outbox of a flash message or an instant photo in write order, as the relay will read it.
export function readMessagingEvents(
    prisma: PrismaService,
    aggregateId: string,
): Promise<OutboxEventRow[]> {
    return prisma.includingDeleted.messagingEvent.findMany({
        where: { aggregateId },
        orderBy: { version: 'asc' },
        select: {
            eventName: true,
            coupleId: true,
            aggregateId: true,
            userId: true,
            version: true,
            published: true,
            eventData: true,
        },
    });
}
