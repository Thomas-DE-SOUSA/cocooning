import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../exceptions/messaging.exception';
import type { PushSubscription } from '../models/push-subscription.aggregate';
import type { PushSubscriptionRepository } from '../ports/push-subscription.repository';
import type { PushEndpoint } from '../value-objects/push-endpoint.vo';

export class PushSubscriptionPreconditionService {
    constructor(
        private readonly pushSubscriptionRepository: PushSubscriptionRepository,
    ) {}

    // Unknown, of the other partner or of another couple, the answer is the same (core.md rule 27).
    async loadOwnSubscription(
        context: ExecutionContext,
        endpoint: PushEndpoint,
    ): Promise<PushSubscription> {
        const subscription = await this.pushSubscriptionRepository.findOfOwner(
            context.coupleId,
            context.userId,
            endpoint.value,
        );
        if (subscription !== null) return subscription;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND,
            message: 'Push subscription not found',
        });
    }
}
