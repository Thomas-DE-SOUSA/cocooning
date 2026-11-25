import { Injectable, type PipeTransform } from '@nestjs/common';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '@cocooning/couple-server-business-logic/messaging';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';

type UploadedFile = { readonly buffer: Uint8Array };

// Buffer.isBuffer, not instanceof: Jest runs the app in another realm than the Buffer multer builds.
const isUploadedFile = (value: unknown): value is UploadedFile =>
    typeof value === 'object' &&
    value !== null &&
    'buffer' in value &&
    Buffer.isBuffer(value.buffer);

// R3: a request without the photo field is refused like an unreadable photo; the domain checks the bytes.
@Injectable()
export class UploadedInstantPhotoPipe implements PipeTransform {
    transform(value: unknown): Uint8Array {
        if (isUploadedFile(value)) return value.buffer;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
            message: 'Invalid instant photo content',
            context: { max: INSTANT_PHOTO_MAX_BYTES },
        });
    }
}
