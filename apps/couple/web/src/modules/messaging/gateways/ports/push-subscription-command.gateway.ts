import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';

// R11: the API side of the subscription of this phone.
export abstract class PushSubscriptionCommandGateway {
    abstract getPushPublicKey(): Promise<Result<string, ApiError>>;
    abstract subscribe(
        subscription: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>>;
    abstract unsubscribe(endpoint: string): Promise<Result<null, ApiError>>;
}
