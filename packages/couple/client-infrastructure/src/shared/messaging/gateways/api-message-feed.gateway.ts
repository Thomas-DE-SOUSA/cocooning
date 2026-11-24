import {
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { MessageFeedGateway } from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type MessageFeedPageResponse,
    MessageFeedPageResponseSchema,
} from '@cocooning/couple-contract/messaging';
import {
    type CursorPaginationQuery,
    CursorPaginationQuerySchema,
} from '@cocooning/couple-contract/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { MessagingEndpoints } from '../endpoints/messaging.endpoints';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Message feed query does not match its contract',
    backendCode: null,
};

// The first page has no cursor: it is left out of the query string.
const toFeedSearch = ({ cursor, limit }: CursorPaginationQuery): string =>
    new URLSearchParams({
        limit: String(limit),
        ...(cursor === null ? {} : { cursor }),
    }).toString();

export class ApiMessageFeedGateway extends MessageFeedGateway {
    constructor(
        private readonly endpoints: MessagingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    // R5: newest first, one page after the cursor (decision 0025).
    override async listMessageFeed(
        query: CursorPaginationQuery,
    ): Promise<Result<MessageFeedPageResponse, ApiError>> {
        const validated = CursorPaginationQuerySchema.safeParse(query);
        if (!validated.success) return fail(OUTSIDE_CONTRACT);
        const result = await sessionRequest(
            this.getSessionToken,
            {
                url: `${this.endpoints.messageFeed}?${toFeedSearch(validated.data)}`,
                method: HttpMethodEnum.GET,
                body: null,
            },
            this.httpConfig,
        );
        return parseResponse(
            result,
            MessageFeedPageResponseSchema,
            this.httpConfig,
        );
    }
}
