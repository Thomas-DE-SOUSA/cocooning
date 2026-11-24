import type { PushSubscription } from '../models/push-subscription.aggregate';

// R11: a partner's phones; (coupleId, endpoint) is unique, the endpoint names one phone.
export abstract class PushSubscriptionRepository {
    abstract save(pushSubscription: PushSubscription): Promise<void>;
    abstract findByEndpoint(
        coupleId: string,
        endpoint: string,
    ): Promise<PushSubscription | null>;
    // A partner's own subscription: the other partner's phone answers null (core.md rule 27).
    abstract findOfOwner(
        coupleId: string,
        ownerId: string,
        endpoint: string,
    ): Promise<PushSubscription | null>;
    // One query for the given couples (core.md rule 9).
    abstract findOfCouples(
        coupleIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<PushSubscription>>;
    // R11: deleted for good, each by its coupleId and id: a forgotten subscription has no history.
    abstract forget(
        pushSubscriptions: ReadonlyArray<PushSubscription>,
    ): Promise<void>;
}
