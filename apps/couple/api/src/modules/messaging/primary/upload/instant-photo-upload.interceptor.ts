import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    type NestInterceptor,
    PayloadTooLargeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    INSTANT_PHOTO_FORM_FIELD,
    MessagingExceptionCodeEnum,
} from '@cocooning/couple-contract/messaging';
import { MessagingException } from '@cocooning/couple-server-business-logic/messaging';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { catchError, type Observable, throwError } from 'rxjs';

// R3: multer keeps the photo in memory and stops reading past INSTANT_PHOTO_MAX_BYTES.
export const InstantPhotoFileInterceptor = FileInterceptor(
    INSTANT_PHOTO_FORM_FIELD,
    { limits: { fileSize: INSTANT_PHOTO_MAX_BYTES, files: 1 } },
);

const tooHeavy = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
        message: 'Invalid instant photo content',
        context: { max: INSTANT_PHOTO_MAX_BYTES },
    });

// Declared before InstantPhotoFileInterceptor: a photo stopped by multer answers 422 like any refused photo, not 413.
@Injectable()
export class InstantPhotoTooHeavyInterceptor implements NestInterceptor {
    intercept(
        _context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        return next
            .handle()
            .pipe(
                catchError((error: unknown) =>
                    throwError(() =>
                        error instanceof PayloadTooLargeException
                            ? tooHeavy()
                            : error,
                    ),
                ),
            );
    }
}
