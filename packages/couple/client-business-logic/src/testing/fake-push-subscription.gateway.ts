import type {
    PushPublicKeyResponse,
    SubscribePushNotificationsRequest,
    UnsubscribePushNotificationsRequest,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { PushSubscriptionGateway } from '../messaging/domain/ports/push-subscription.gateway';
import type { ApiError } from '../shared/api-error';
import { A_PUSH_PUBLIC_KEY } from './messaging-fixtures';

export type PushSubscriptionGatewayCall =
    | {
          readonly operation: 'subscribePushNotifications';
          readonly request: SubscribePushNotificationsRequest;
      }
    | {
          readonly operation: 'unsubscribePushNotifications';
          readonly request: UnsubscribePushNotificationsRequest;
      }
    | { readonly operation: 'getPushPublicKey' };

// The public key answers every read, or one refusal answers every call.
export class FakePushSubscriptionGateway extends PushSubscriptionGateway {
    readonly calls: PushSubscriptionGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override subscribePushNotifications(
        request: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return this.respond(
            { operation: 'subscribePushNotifications', request },
            null,
        );
    }

    override unsubscribePushNotifications(
        request: UnsubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return this.respond(
            { operation: 'unsubscribePushNotifications', request },
            null,
        );
    }

    override getPushPublicKey(): Promise<
        Result<PushPublicKeyResponse, ApiError>
    > {
        return this.respond(
            { operation: 'getPushPublicKey' },
            A_PUSH_PUBLIC_KEY,
        );
    }

    private respond<T>(
        call: PushSubscriptionGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
