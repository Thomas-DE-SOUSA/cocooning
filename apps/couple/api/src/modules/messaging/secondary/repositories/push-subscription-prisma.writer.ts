import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type {
    MessagingException,
    PushSubscriptionSnapshot,
} from '@cocooning/couple-server-business-logic/messaging';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writePushSubscription(
    tx: Transaction,
    snapshot: PushSubscriptionSnapshot,
    conflict: () => MessagingException,
): Promise<void> {
    const { id, coupleId, ownerId, endpoint, p256dh, auth, metadata } =
        snapshot;
    const stored = await tx.pushSubscription.findFirst({
        where: { coupleId, id },
        select: { version: true },
    });
    const updatedAt = new Date(metadata.updatedAt);
    if (stored === null) {
        await tx.pushSubscription.create({
            data: {
                id,
                coupleId,
                ownerId,
                endpoint,
                p256dh,
                auth,
                version: FIRST_VERSION,
                createdAt: new Date(metadata.createdAt),
                updatedAt,
            },
        });
        return;
    }
    const { count } = await tx.pushSubscription.updateMany({
        where: { coupleId, id, version: snapshot.version },
        data: { ownerId, p256dh, auth, updatedAt, version: { increment: 1 } },
    });
    if (count === 0) throw conflict();
}
