import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { HttpRequest, HttpRequestConfig } from './http-request-options';
import { sendHttpRequest } from './http-send';
import { parseJson } from './parse-json';

export type HttpBytesResponse = {
    readonly bytes: Uint8Array<ArrayBuffer>;
    readonly contentType: string;
};

type ReceivedBytes =
    | {
          readonly ok: true;
          readonly bytes: Uint8Array<ArrayBuffer>;
          readonly contentType: string | null;
      }
    | { readonly ok: false; readonly status: number; readonly text: string };

const readBytes = async (response: Response): Promise<ReceivedBytes> => {
    if (!response.ok) {
        return {
            ok: false,
            status: response.status,
            text: await response.text(),
        };
    }
    return {
        ok: true,
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: response.headers.get('Content-Type'),
    };
};

// A file answered as bytes; a refusal still carries the JSON error body of the API.
export async function httpRequestBytes<TError>(
    request: HttpRequest,
    config: HttpRequestConfig<TError>,
): Promise<Result<HttpBytesResponse, TError>> {
    const received = await sendHttpRequest(request, '*/*', readBytes, config);
    if (!received.success) return received;
    return toBytesResponse(received.value, config);
}

function toBytesResponse<TError>(
    received: ReceivedBytes,
    config: HttpRequestConfig<TError>,
): Result<HttpBytesResponse, TError> {
    if (!received.ok) {
        const body = parseJson(received.text);
        return fail(
            config.mapHttpError(
                received.status,
                body.success ? body.value : null,
            ),
        );
    }
    if (received.contentType === null) {
        return fail(
            config.createInvalidResponseError('Response has no content type'),
        );
    }
    return ok({ bytes: received.bytes, contentType: received.contentType });
}
