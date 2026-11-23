import {
    type HttpRequestConfig,
    HttpMethodEnum,
    httpRequest,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { AuthenticationGateway } from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type SignInRequest,
    SignInRequestSchema,
    type SignInResponse,
    SignInResponseSchema,
} from '@cocooning/couple-contract/authentication';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { AuthenticationEndpoints } from '../endpoints/authentication.endpoints';

const INVALID_REQUEST: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Sign-in request does not match its contract',
    backendCode: null,
};

export class ApiAuthenticationGateway extends AuthenticationGateway {
    constructor(
        private readonly endpoints: AuthenticationEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async signIn(
        request: SignInRequest,
    ): Promise<Result<SignInResponse, ApiError>> {
        const validated = SignInRequestSchema.safeParse(request);
        if (!validated.success) return fail(INVALID_REQUEST);
        const result = await httpRequest(
            {
                url: this.endpoints.signIn,
                method: HttpMethodEnum.POST,
                headers: {},
                body: validated.data,
            },
            this.httpConfig,
        );
        return parseResponse(result, SignInResponseSchema, this.httpConfig);
    }

    // 204 without body: the sessions of every device are closed (decision 0034).
    override async signOut(): Promise<Result<null, ApiError>> {
        const result = await sessionRequest(
            this.getSessionToken,
            {
                url: this.endpoints.signOut,
                method: HttpMethodEnum.DELETE,
                body: null,
            },
            this.httpConfig,
        );
        return result.success ? ok(null) : result;
    }
}
