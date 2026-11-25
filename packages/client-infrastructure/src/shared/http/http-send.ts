import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { HttpRequest, HttpRequestConfig } from './http-request-options';

const NO_BODY = null;

type FetchBody = string | FormData | null;

// One fetch with its timeout; reading the body belongs to the attempt, so a cut while reading is a network error too.
export async function sendHttpRequest<TReceived, TError>(
    request: HttpRequest,
    accept: string,
    read: (response: Response) => Promise<TReceived>,
    config: HttpRequestConfig<TError>,
): Promise<Result<TReceived, TError>> {
    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers: buildHeaders(request, accept),
            body: buildBody(request.body),
            signal: AbortSignal.timeout(config.timeoutMs),
        });
        return ok(await read(response));
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Network error';
        return fail(config.createNetworkError(message));
    }
}

// A FormData body goes as is: the runtime writes its multipart Content-Type with the boundary.
function buildBody(body: unknown): FetchBody {
    if (body === NO_BODY) return null;
    if (body instanceof FormData) return body;
    return JSON.stringify(body);
}

function buildHeaders(
    request: HttpRequest,
    accept: string,
): Record<string, string> {
    const isJson =
        request.body !== NO_BODY && !(request.body instanceof FormData);
    const contentType: Record<string, string> = isJson
        ? { 'Content-Type': 'application/json' }
        : {};
    return { Accept: accept, ...contentType, ...request.headers };
}
