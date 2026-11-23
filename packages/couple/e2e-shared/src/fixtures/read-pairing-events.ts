import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type PairingEventRow = {
    readonly eventName: string;
    readonly coupleId: string;
    readonly aggregateId: string;
    readonly userId: string;
    readonly version: number;
    readonly published: boolean;
    readonly eventData: unknown;
};

// The outbox of a couple in write order, as the relay will read it.
export function readPairingEvents(
    prisma: PrismaService,
    coupleId: string,
): Promise<PairingEventRow[]> {
    return prisma.includingDeleted.pairingEvent.findMany({
        where: { coupleId },
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
