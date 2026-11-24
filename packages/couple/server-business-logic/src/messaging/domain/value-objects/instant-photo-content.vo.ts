import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { InstantPhotoContentType } from '@cocooning/couple-shared-kernel/enums';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { MessagingException } from '../exceptions/messaging.exception';
import { detectInstantPhotoContentType } from './instant-photo-signature';

type InstantPhotoContentProps = {
    readonly bytes: Uint8Array;
    readonly contentType: InstantPhotoContentType;
};

// The bytes of a photo as sent, never kept in the aggregate: they go to the file storage.
export class InstantPhotoContent extends ValueObject<InstantPhotoContentProps> {
    private constructor(props: InstantPhotoContentProps) {
        super(props);
        Object.freeze(this);
    }

    // R3: JPEG, PNG, WebP or HEIC by its first bytes, at most INSTANT_PHOTO_MAX_BYTES.
    static create(bytes: Uint8Array): InstantPhotoContent {
        const contentType = detectInstantPhotoContentType(bytes);
        if (contentType === null || bytes.length > INSTANT_PHOTO_MAX_BYTES) {
            throw new MessagingException({
                code: MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
                message: 'Invalid instant photo content',
                context: { max: INSTANT_PHOTO_MAX_BYTES },
            });
        }
        return new InstantPhotoContent({ bytes, contentType });
    }

    get bytes(): Uint8Array {
        return this.props.bytes;
    }

    get contentType(): InstantPhotoContentType {
        return this.props.contentType;
    }
}
