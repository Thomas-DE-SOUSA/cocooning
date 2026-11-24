import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { PushSubscriptionGateway } from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type PushPublicKeyResponse,
    PushPublicKeyResponseSchema,
    type SubscribePushNotificationsRequest,
    SubscribePushNotificationsRequestSchema,
    type UnsubscribePushNotificationsRequest,
    UnsubscribePushNotificationsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { MessagingEndpoints } from '../endpoints/messaging.endpoints';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Push subscription request does not match its contract',
    backendCode: null,
};

const NO_BODY = null;

export class ApiPushSubscriptionGateway extends PushSubscriptionGateway {
    constructor(
        private readonly endpoints: MessagingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    // R11: PUT, idempotent on the endpoint of the phone.
    override subscribePushNotifications(
        request: SubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        const validated =
            SubscribePushNotificationsRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.withoutContent(
            HttpMethodEnum.PUT,
            this.endpoints.pushSubscribe,
            validated.data,
        );
    }

    override unsubscribePushNotifications(
        request: UnsubscribePushNotificationsRequest,
    ): Promise<Result<null, ApiError>> {
        const validated =
            UnsubscribePushNotificationsRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.withoutContent(
            HttpMethodEnum.POST,
            this.endpoints.pushUnsubscribe,
            validated.data,
        );
    }

    override async getPushPublicKey(): Promise<
        Result<PushPublicKeyResponse, ApiError>
    > {
        const result = await this.request(
            HttpMethodEnum.GET,
            this.endpoints.pushPublicKey,
            NO_BODY,
        );
        return parseResponse(
            result,
            PushPublicKeyResponseSchema,
            this.httpConfig,
        );
    }

    // The API answers 204 without a body.
    private async withoutContent(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<null, ApiError>> {
        const result = await this.request(method, url, body);
        return result.success ? ok(null) : result;
    }

    private request(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<unknown, ApiError>> {
        return sessionRequest(
            this.getSessionToken,
            { url, method, body },
            this.httpConfig,
        );
    }
}
