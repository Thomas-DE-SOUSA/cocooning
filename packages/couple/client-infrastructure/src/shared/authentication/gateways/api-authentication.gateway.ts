import {
    type HttpRequestConfig,
    HttpMethodEnum,
    httpRequest,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import {
    AuthenticationGateway,
    type SignInClientContext,
} from '@cocooning/couple-client-business-logic/authentication';
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
import {
    type SessionTokenProvider,
    sessionHeaders,
} from '../../session/session-headers';
import type { AuthenticationEndpoints } from '../endpoints/authentication.endpoints';

const INVALID_REQUEST: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Sign-in request does not match its contract',
    backendCode: null,
};

// core-frontend.md rule 13: the API sees the browser, not the Next server. x-forwarded-for keeps its standard name (core-backend.md rule 18).
function clientHeaders(client: SignInClientContext): Record<string, string> {
    return {
        ...(client.ipAddress === null
            ? {}
            : { 'x-forwarded-for': client.ipAddress }),
        ...(client.userAgent === null
            ? {}
            : { 'user-agent': client.userAgent }),
    };
}

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
        client: SignInClientContext,
    ): Promise<Result<SignInResponse, ApiError>> {
        const validated = SignInRequestSchema.safeParse(request);
        if (!validated.success) return fail(INVALID_REQUEST);
        const result = await httpRequest(
            {
                url: this.endpoints.signIn,
                method: HttpMethodEnum.POST,
                headers: clientHeaders(client),
                body: validated.data,
            },
            this.httpConfig,
        );
        return parseResponse(result, SignInResponseSchema, this.httpConfig);
    }

    // 204 without body: the sessions of every device are closed (decision 0034).
    override async signOut(): Promise<Result<null, ApiError>> {
        const headers = await sessionHeaders(this.getSessionToken);
        if (!headers.success) return headers;
        const result = await httpRequest(
            {
                url: this.endpoints.signOut,
                method: HttpMethodEnum.DELETE,
                headers: headers.value,
                body: null,
            },
            this.httpConfig,
        );
        return result.success ? ok(null) : result;
    }
}
