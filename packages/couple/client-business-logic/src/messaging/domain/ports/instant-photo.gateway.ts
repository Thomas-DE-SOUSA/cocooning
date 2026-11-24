import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoFile } from '../models/instant-photo-file';
import type { InstantPhotoUpload } from '../models/instant-photo-upload';

export abstract class InstantPhotoGateway {
    abstract sendInstantPhoto(
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>>;
    abstract withdrawInstantPhoto(
        instantPhotoId: string,
    ): Promise<Result<null, ApiError>>;
    abstract getInstantPhotoFile(
        instantPhotoId: string,
    ): Promise<Result<InstantPhotoFile, ApiError>>;
}
