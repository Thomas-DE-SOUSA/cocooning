import {
    type HttpRequest,
    type HttpRequestConfig,
    httpRequest,
} from '@cocooning/client-infrastructure/shared/http';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { type SessionTokenProvider, sessionHeaders } from './session-headers';

export type SessionRequest = Omit<HttpRequest, 'headers'>;

// One request on behalf of the signed-in partner; without a session, UNAUTHORIZED and no call.
export async function sessionRequest(
    getSessionToken: SessionTokenProvider,
    request: SessionRequest,
    config: HttpRequestConfig<ApiError>,
): Promise<Result<unknown, ApiError>> {
    const headers = await sessionHeaders(getSessionToken);
    if (!headers.success) return headers;
    return httpRequest({ ...request, headers: headers.value }, config);
}
