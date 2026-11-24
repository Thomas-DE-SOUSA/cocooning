import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import {
    type InstantPhotoFile,
    InstantPhotoGateway,
    type InstantPhotoUpload,
} from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import {
    type MessageFeedItemResponse,
    MessageFeedItemResponseSchema,
} from '@cocooning/couple-contract/messaging';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { sessionBytesRequest } from '../../session/session-bytes-request';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { MessagingEndpoints } from '../endpoints/messaging.endpoints';
import { toInstantPhotoFile } from './to-instant-photo-file.mapper';
import { toInstantPhotoFormData } from './to-instant-photo-form-data.mapper';

export class ApiInstantPhotoGateway extends InstantPhotoGateway {
    constructor(
        private readonly endpoints: MessagingEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async sendInstantPhoto(
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.POST,
            this.endpoints.instantPhotos,
            toInstantPhotoFormData(photo),
        );
        return parseResponse(
            result,
            MessageFeedItemResponseSchema,
            this.httpConfig,
        );
    }

    // R6: the API answers 204 without a body.
    override async withdrawInstantPhoto(
        instantPhotoId: string,
    ): Promise<Result<null, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.DELETE,
            this.endpoints.instantPhoto(instantPhotoId),
            null,
        );
        return result.success ? ok(null) : result;
    }

    override async getInstantPhotoFile(
        instantPhotoId: string,
    ): Promise<Result<InstantPhotoFile, ApiError>> {
        const result = await sessionBytesRequest(
            this.getSessionToken,
            {
                url: this.endpoints.instantPhotoFile(instantPhotoId),
                method: HttpMethodEnum.GET,
                body: null,
            },
            this.httpConfig,
        );
        return toInstantPhotoFile(result, this.httpConfig);
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
