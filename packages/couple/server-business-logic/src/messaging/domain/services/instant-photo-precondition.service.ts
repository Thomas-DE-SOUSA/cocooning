import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { FileStorage, StoredFile } from '@cocooning/shared-kernel/ports';
import { MessagingException } from '../exceptions/messaging.exception';
import type { InstantPhoto } from '../models/instant-photo.aggregate';
import type { InstantPhotoRepository } from '../ports/instant-photo.repository';

export class InstantPhotoPreconditionService {
    constructor(
        private readonly instantPhotoRepository: InstantPhotoRepository,
        private readonly fileStorage: FileStorage,
    ) {}

    // Unknown, withdrawn or of another couple, the answer is the same.
    async loadInstantPhoto(
        context: ExecutionContext,
        instantPhotoId: string,
    ): Promise<InstantPhoto> {
        const instantPhoto = await this.instantPhotoRepository.findById(
            context.coupleId,
            instantPhotoId,
        );
        if (instantPhoto !== null) return instantPhoto;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND,
            message: 'Instant photo not found',
        });
    }

    // A live photo whose file is gone is corrupted data, never the partner's fault.
    async loadFileOf(instantPhoto: InstantPhoto): Promise<StoredFile> {
        const file = await this.fileStorage.read(instantPhoto.fileKey);
        if (file !== null) return file;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_DATA_CORRUPTED,
            message: 'Instant photo file missing',
        });
    }
}
