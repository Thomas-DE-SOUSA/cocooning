import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoFile } from '../../domain/models/instant-photo-file';
import type { InstantPhotoGateway } from '../../domain/ports/instant-photo.gateway';

// R5, R9: the bytes of a photo of the feed; a hidden photo of the day is NOT_FOUND.
export class GetInstantPhotoFileUseCase {
    constructor(private readonly instantPhotoGateway: InstantPhotoGateway) {}

    execute(
        instantPhotoId: string,
    ): Promise<Result<InstantPhotoFile, ApiError>> {
        return this.instantPhotoGateway.getInstantPhotoFile(instantPhotoId);
    }
}
