import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import {
    type InstantPhotoUpload,
    PhotoPromptGateway,
} from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
    type TodayPhotoPromptResponse,
    TodayPhotoPromptResponseSchema,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { MessagingEndpoints } from '../endpoints/messaging.endpoints';
import { toInstantPhotoFormData } from './to-instant-photo-form-data.mapper';

const NO_BODY = null;

export class ApiPhotoPromptGateway extends PhotoPromptGateway {
    constructor(
        private readonly endpoints: MessagingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async getTodayPhotoPrompt(): Promise<
        Result<TodayPhotoPromptResponse, ApiError>
    > {
        const result = await this.request(
            HttpMethodEnum.GET,
            this.endpoints.todayPhotoPrompt,
            NO_BODY,
        );
        return parseResponse(
            result,
            TodayPhotoPromptResponseSchema,
            this.httpConfig,
        );
    }

    // R8: sent like a spontaneous photo, to the path of its photo prompt.
    override async answerPhotoPrompt(
        photoPromptId: string,
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.POST,
            this.endpoints.photoPromptAnswer(photoPromptId),
            toInstantPhotoFormData(photo),
        );
        return parseResponse(
            result,
            MessageFeedItemResponseSchema,
            this.httpConfig,
        );
    }

    private request(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<unknown, ApiError>> {
        return sessionRequest(
            this.getSessionToken,
            { url, method, body },
            this.httpConfig,
        );
    }
}
