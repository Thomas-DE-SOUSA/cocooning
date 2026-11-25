import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { PushSubscriptionCommandGateway } from '../ports/push-subscription-command.gateway';

type Operation = 'getPushPublicKey' | 'subscribe' | 'unsubscribe';

export const A_PHONE_PUBLIC_KEY = 'BPhonePublicKey';

// Every operation succeeds unless a scenario refuses it.
export class FakePushSubscriptionCommandGateway extends PushSubscriptionCommandGateway {
    readonly calls: string[] = [];
    private readonly refusals = new Map<Operation, ApiError>();

    givenRefusal(operation: Operation, error: ApiError): void {
        this.refusals.set(operation, error);
    }

    override getPushPublicKey(): Promise<Result<string, ApiError>> {
        return this.answer('getPushPublicKey', '', A_PHONE_PUBLIC_KEY);
    }

    override subscribe(
        subscription: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return this.answer('subscribe', subscription.endpoint, null);
    }

    override unsubscribe(endpoint: string): Promise<Result<null, ApiError>> {
        return this.answer('unsubscribe', endpoint, null);
    }

    private answer<T>(
        operation: Operation,
        endpoint: string,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(
            endpoint === '' ? operation : `${operation}:${endpoint}`,
        );
        const refusal = this.refusals.get(operation);
        return Promise.resolve(
            refusal === undefined ? ok(value) : fail(refusal),
        );
    }
}
