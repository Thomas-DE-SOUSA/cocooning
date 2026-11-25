import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoUpload } from '../../domain/models/instant-photo-upload';
import type { InstantPhotoGateway } from '../../domain/ports/instant-photo.gateway';

// R1, R3: a spontaneous photo of the phone camera, seen by the other at once.
export class SendInstantPhotoUseCase {
    constructor(private readonly instantPhotoGateway: InstantPhotoGateway) {}

    execute(
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.instantPhotoGateway.sendInstantPhoto(photo);
    }
}
