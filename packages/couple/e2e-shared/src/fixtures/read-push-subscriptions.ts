import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type PushSubscriptionRow = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly endpoint: string;
    readonly p256dh: string;
    readonly auth: string;
    readonly version: number;
};

// Every stored subscription of a couple, by endpoint.
export function readPushSubscriptions(
    prisma: PrismaService,
    coupleId: string,
): Promise<PushSubscriptionRow[]> {
    return prisma.includingDeleted.pushSubscription.findMany({
        where: { coupleId },
        orderBy: { endpoint: 'asc' },
        select: {
            coupleId: true,
            ownerId: true,
            endpoint: true,
            p256dh: true,
            auth: true,
            version: true,
        },
    });
}
