import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    AuthenticationExceptionCodeEnum,
    SESSION_COOKIE_NAME,
} from '@cocooning/couple-contract/authentication';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

// Read when the call is made, never when the module is built: the web app passes it unresolved (decision 0036).
export type SessionTokenProvider = () => Promise<string | null>;

const SESSION_MISSING: ApiError = {
    code: ApiErrorCodeEnum.UNAUTHORIZED,
    message: 'No session to forward',
    backendCode: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
};

// The API session guard reads the cookie it set through the PWA: the Next server sends it back on the partner's behalf.
export async function sessionHeaders(
    getSessionToken: SessionTokenProvider,
): Promise<Result<Record<string, string>, ApiError>> {
    const token = await getSessionToken();
    if (token === null || token === '') return fail(SESSION_MISSING);
    return ok({ Cookie: `${SESSION_COOKIE_NAME}=${token}` });
}
