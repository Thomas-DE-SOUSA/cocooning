import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';
import { PUSH_KEYS } from './push-test-data';

// The routes of the push subscriptions, sent as a partner signed in at the clock of the test app.
export abstract class PushSubscriptionRequests {
    abstract as(userId: string): TestClient;

    subscribe(
        userId: string,
        endpoint: string,
        keys: unknown = PUSH_KEYS,
    ): Promise<TestResponse> {
        return this.as(userId).put(ApiRouterEnum.PUSH_SUBSCRIPTION_SUBSCRIBE, {
            endpoint,
            keys,
            expirationTime: null,
        });
    }

    unsubscribe(userId: string, endpoint: string): Promise<TestResponse> {
        return this.as(userId).post(
            ApiRouterEnum.PUSH_SUBSCRIPTION_UNSUBSCRIBE,
            { endpoint },
        );
    }

    pushPublicKey(userId: string): Promise<TestResponse> {
        return this.as(userId).get(
            ApiRouterEnum.PUSH_SUBSCRIPTION_PUBLIC_KEY_GET,
        );
    }
}
