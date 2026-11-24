import {
    type HttpBytesResponse,
    type HttpRequestConfig,
    httpRequestBytes,
} from '@cocooning/client-infrastructure/shared/http';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { type SessionTokenProvider, sessionHeaders } from './session-headers';
import type { SessionRequest } from './session-request';

// A file read on behalf of the signed-in partner; without a session, UNAUTHORIZED and no call.
export async function sessionBytesRequest(
    getSessionToken: SessionTokenProvider,
    request: SessionRequest,
    config: HttpRequestConfig<ApiError>,
): Promise<Result<HttpBytesResponse, ApiError>> {
    const headers = await sessionHeaders(getSessionToken);
    if (!headers.success) return headers;
    return httpRequestBytes({ ...request, headers: headers.value }, config);
}
