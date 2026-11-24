import { fail, type Result } from '@cocooning/shared-kernel/utils';
import type { HttpRequest, HttpRequestConfig } from './http-request-options';
import { sendHttpRequest } from './http-send';
import { parseJson } from './parse-json';

type ReceivedResponse = {
    readonly ok: boolean;
    readonly status: number;
    readonly text: string;
};

const readText = async (response: Response): Promise<ReceivedResponse> => ({
    ok: response.ok,
    status: response.status,
    text: await response.text(),
});

export async function httpRequest<TError>(
    request: HttpRequest,
    config: HttpRequestConfig<TError>,
): Promise<Result<unknown, TError>> {
    const received = await sendHttpRequest(
        request,
        'application/json',
        readText,
        config,
    );
    if (!received.success) return received;
    return readResponse(received.value, config);
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
