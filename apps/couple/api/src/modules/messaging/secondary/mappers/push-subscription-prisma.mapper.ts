import type { PushSubscription } from '@cocooning/couple-prisma/client';
import type { PushSubscriptionSnapshot } from '@cocooning/couple-server-business-logic/messaging';

export type PushSubscriptionRow = PushSubscription;

// No deleted_at: a forgotten subscription is deleted for good (R11).
export function toPushSubscriptionSnapshot(
    raw: PushSubscriptionRow,
): PushSubscriptionSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        endpoint: raw.endpoint,
        p256dh: raw.p256dh,
        auth: raw.auth,
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt: null,
        },
    };
}
