import {
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { FlashMessageGateway } from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
    type SendFlashMessageRequest,
    SendFlashMessageRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { MessagingEndpoints } from '../endpoints/messaging.endpoints';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Flash message request does not match its contract',
    backendCode: null,
};

export class ApiFlashMessageGateway extends FlashMessageGateway {
    constructor(
        private readonly endpoints: MessagingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    // R2: the text is checked by the contract before the call.
    override async sendFlashMessage(
        request: SendFlashMessageRequest,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        const validated = SendFlashMessageRequestSchema.safeParse(request);
        if (!validated.success) return fail(OUTSIDE_CONTRACT);
        const result = await sessionRequest(
            this.getSessionToken,
            {
                url: this.endpoints.flashMessages,
                method: HttpMethodEnum.POST,
                body: validated.data,
            },
            this.httpConfig,
        );
        return parseResponse(
            result,
            MessageFeedItemResponseSchema,
            this.httpConfig,
        );
    }

    // R6: the API answers 204 without a body.
    override async withdrawFlashMessage(
        flashMessageId: string,
    ): Promise<Result<null, ApiError>> {
        const result = await sessionRequest(
            this.getSessionToken,
            {
                url: this.endpoints.flashMessage(flashMessageId),
                method: HttpMethodEnum.DELETE,
                body: null,
            },
            this.httpConfig,
        );
        return result.success ? ok(null) : result;
    }
}
