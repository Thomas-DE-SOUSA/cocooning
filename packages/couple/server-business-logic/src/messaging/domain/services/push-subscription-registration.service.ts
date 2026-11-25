import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { PushSubscription } from '../models/push-subscription.aggregate';
import type { PushSubscriptionRepository } from '../ports/push-subscription.repository';
import type { PushEndpoint } from '../value-objects/push-endpoint.vo';
import type { PushSubscriptionKeys } from '../value-objects/push-subscription-keys.vo';

export class PushSubscriptionRegistrationService {
    constructor(
        private readonly pushSubscriptionRepository: PushSubscriptionRepository,
    ) {}

    // R11: one subscription per phone of the couple; subscribing again is idempotent and follows the partner signed in.
    async subscriptionFor(
        context: ExecutionContext,
        endpoint: PushEndpoint,
        keys: PushSubscriptionKeys,
        now: Date,
    ): Promise<PushSubscription> {
        const { coupleId, userId } = context;
        const stored = await this.pushSubscriptionRepository.findByEndpoint(
            coupleId,
            endpoint.value,
        );
        if (stored === null) {
            return PushSubscription.subscribe(
                { coupleId, ownerId: userId, endpoint, keys },
                now,
            );
        }
        stored.renewFor(userId, keys, now);
        return stored;
    }
}
