import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { PushSubscriptionCommandGateway } from '../ports/push-subscription-command.gateway';

export type PushSubscriptionCommandActions = {
    readonly getPushPublicKey: () => Promise<Result<string, ApiError>>;
    readonly subscribe: (
        subscription: SubscribePushNotificationsRequest,
    ) => Promise<Result<null, ApiError>>;
    readonly unsubscribe: (endpoint: string) => Promise<Result<null, ApiError>>;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Push subscription server action unreachable',
    backendCode: null,
};

// Every call goes through runServerAction: a rejected action becomes NETWORK_ERROR (decision 0035).
export class ServerActionPushSubscriptionCommandGateway extends PushSubscriptionCommandGateway {
    constructor(private readonly actions: PushSubscriptionCommandActions) {
        super();
    }

    override getPushPublicKey(): Promise<Result<string, ApiError>> {
        return runServerAction(this.actions.getPushPublicKey, UNREACHABLE);
    }

    override subscribe(
        subscription: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.subscribe(subscription),
            UNREACHABLE,
        );
    }

    override unsubscribe(endpoint: string): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.unsubscribe(endpoint),
            UNREACHABLE,
        );
    }
}
