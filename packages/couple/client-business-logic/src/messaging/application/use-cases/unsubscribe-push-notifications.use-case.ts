import type { UnsubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PushSubscriptionGateway } from '../../domain/ports/push-subscription.gateway';

// R11: the partner forgets one of their phones, named by its endpoint.
export class UnsubscribePushNotificationsUseCase {
    constructor(
        private readonly pushSubscriptionGateway: PushSubscriptionGateway,
    ) {}

    execute(
        request: UnsubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return this.pushSubscriptionGateway.unsubscribePushNotifications(
            request,
        );
    }
}
