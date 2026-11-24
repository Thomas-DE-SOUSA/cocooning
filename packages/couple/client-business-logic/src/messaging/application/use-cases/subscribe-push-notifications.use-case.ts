import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PushSubscriptionGateway } from '../../domain/ports/push-subscription.gateway';

// R11: this phone receives the notifications of the signed-in partner; subscribing again renews it.
export class SubscribePushNotificationsUseCase {
    constructor(
        private readonly pushSubscriptionGateway: PushSubscriptionGateway,
    ) {}

    execute(
        subscription: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return this.pushSubscriptionGateway.subscribePushNotifications(
            subscription,
        );
    }
}
