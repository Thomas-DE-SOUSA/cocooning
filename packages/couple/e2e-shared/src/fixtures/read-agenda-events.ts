import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { OutboxEventRow } from './read-pairing-events';

// The outbox of a calendar event or a calendar label in write order, as the relay will read it.
export function readAgendaEvents(
    prisma: PrismaService,
    aggregateId: string,
): Promise<OutboxEventRow[]> {
    return prisma.includingDeleted.agendaEvent.findMany({
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
