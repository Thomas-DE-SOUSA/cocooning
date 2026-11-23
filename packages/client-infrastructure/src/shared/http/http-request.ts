import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { HttpRequest, HttpRequestConfig } from './http-request-options';

type ReceivedResponse = {
    readonly ok: boolean;
    readonly status: number;
    readonly text: string;
};

const NO_BODY = null;

export async function httpRequest<TError>(
    request: HttpRequest,
    config: HttpRequestConfig<TError>,
): Promise<Result<unknown, TError>> {
    const received = await send(request, config);
    if (!received.success) return received;
    return readResponse(received.value, config);
}

async function send<TError>(
    request: HttpRequest,
    config: HttpRequestConfig<TError>,
): Promise<Result<ReceivedResponse, TError>> {
    try {
        const response = await fetch(request.url, {
            method: request.method,
            headers: buildHeaders(request),
            body:
                request.body === NO_BODY ? null : JSON.stringify(request.body),
            signal: AbortSignal.timeout(config.timeoutMs),
        });
        const text = await response.text();
        return ok({ ok: response.ok, status: response.status, text });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Network error';
        return fail(config.createNetworkError(message));
    }
}

function buildHeaders(request: HttpRequest): Record<string, string> {
    const contentType: Record<string, string> =
        request.body === NO_BODY ? {} : { 'Content-Type': 'application/json' };
    return { Accept: 'application/json', ...contentType, ...request.headers };
}

function readResponse<TError>(
    response: ReceivedResponse,
    config: HttpRequestConfig<TError>,
): Result<unknown, TError> {
    const body = parseJson(response.text);
    if (!response.ok) {
        return fail(
            config.mapHttpError(
                response.status,
                body.success ? body.value : null,
            ),
        );
    }
    if (!body.success) {
        return fail(
            config.createInvalidResponseError('Response body is not JSON'),
        );
    }
    return body;
}

function parseJson(text: string): Result<unknown, null> {
    if (text.length === 0) return ok(null);
    try {
        return ok(JSON.parse(text) as unknown);
    } catch {
        return fail(null);
    }
}
