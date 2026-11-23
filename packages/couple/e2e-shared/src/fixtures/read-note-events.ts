import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { OutboxEventRow } from './read-pairing-events';

// The outbox of a note in write order, as the relay will read it.
export function readNoteEvents(
    prisma: PrismaService,
    noteId: string,
): Promise<OutboxEventRow[]> {
    return prisma.includingDeleted.noteEvent.findMany({
        where: { aggregateId: noteId },
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
