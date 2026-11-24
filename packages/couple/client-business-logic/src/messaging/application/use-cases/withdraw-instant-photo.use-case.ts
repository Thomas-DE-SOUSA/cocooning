import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { InstantPhotoGateway } from '../../domain/ports/instant-photo.gateway';

// R6, R8: only the author withdraws their photo; a withdrawn photo of the day no longer counts.
export class WithdrawInstantPhotoUseCase {
    constructor(private readonly instantPhotoGateway: InstantPhotoGateway) {}

    execute(instantPhotoId: string): Promise<Result<null, ApiError>> {
        return this.instantPhotoGateway.withdrawInstantPhoto(instantPhotoId);
    }
}
