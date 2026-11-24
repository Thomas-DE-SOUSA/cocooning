import type {
    PushPublicKeyResponse,
    SubscribePushNotificationsRequest,
    UnsubscribePushNotificationsRequest,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// R11: the phones of the signed-in partner that receive the notifications.
export abstract class PushSubscriptionGateway {
    abstract subscribePushNotifications(
        request: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>>;
    abstract unsubscribePushNotifications(
        request: UnsubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>>;
    abstract getPushPublicKey(): Promise<
        Result<PushPublicKeyResponse, ApiError>
    >;
}
