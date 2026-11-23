import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    httpRequest,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { PairingGateway } from '@cocooning/couple-client-business-logic/pairing';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CoupleResponse,
    CoupleResponseSchema,
    type JoinCoupleRequest,
    JoinCoupleRequestSchema,
} from '@cocooning/couple-contract/pairing';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import {
    type SessionTokenProvider,
    sessionHeaders,
} from '../../session/session-headers';
import type { PairingEndpoints } from '../endpoints/pairing.endpoints';

const INVALID_REQUEST: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Join request does not match its contract',
    backendCode: null,
};

const NO_BODY = null;

export class ApiPairingGateway extends PairingGateway {
    constructor(
        private readonly endpoints: PairingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override getMyCouple(): Promise<Result<CoupleResponse, ApiError>> {
        return this.send(HttpMethodEnum.GET, this.endpoints.myCouple, NO_BODY);
    }

    override createCouple(): Promise<Result<CoupleResponse, ApiError>> {
        return this.send(
            HttpMethodEnum.POST,
            this.endpoints.createCouple,
            NO_BODY,
        );
    }

    override joinCouple(
        request: JoinCoupleRequest,
    ): Promise<Result<CoupleResponse, ApiError>> {
        const validated = JoinCoupleRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(INVALID_REQUEST));
        return this.send(
            HttpMethodEnum.POST,
            this.endpoints.joinCouple,
            validated.data,
        );
    }

    override renewInvitationCode(): Promise<Result<CoupleResponse, ApiError>> {
        return this.send(
            HttpMethodEnum.POST,
            this.endpoints.renewInvitationCode,
            NO_BODY,
        );
    }

    private async send(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<CoupleResponse, ApiError>> {
        const headers = await sessionHeaders(this.getSessionToken);
        if (!headers.success) return headers;
        const result = await httpRequest(
            { url, method, headers: headers.value, body },
            this.httpConfig,
        );
        return parseResponse(result, CoupleResponseSchema, this.httpConfig);
    }
}
