import type {
    HttpMethod,
    HttpRequestConfig,
} from '@cocooning/client-infrastructure/shared/http';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { ResponseParser } from './note-folders.responses';

type ValidatedRequest =
    | { readonly success: true; readonly data: unknown }
    | { readonly success: false };

// The JSON calls of the notes gateways, sent on behalf of the signed-in partner (decision 0036).
export class NotesRequest {
    constructor(
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
        private readonly outsideContract: ApiError,
    ) {}

    // A request outside its contract never reaches the API.
    sendValid<T>(
        method: HttpMethod,
        url: string,
        valid: ValidatedRequest,
        parse: ResponseParser<T>,
    ): Promise<Result<T, ApiError>> {
        if (!valid.success) return Promise.resolve(fail(this.outsideContract));
        return this.send(method, url, valid.data, parse);
    }

    async send<T>(
        method: HttpMethod,
        url: string,
        body: unknown,
        parse: ResponseParser<T>,
    ): Promise<Result<T, ApiError>> {
        const result = await sessionRequest(
            this.getSessionToken,
            { url, method, body },
            this.httpConfig,
        );
        return parse(result, this.httpConfig);
    }
}
