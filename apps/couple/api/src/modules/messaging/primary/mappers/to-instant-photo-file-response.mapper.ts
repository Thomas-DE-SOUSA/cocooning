import { StreamableFile } from '@nestjs/common';
import type { InstantPhotoFileView } from '@cocooning/couple-server-business-logic/messaging';

// The bytes of the photo with the content type detected when it was sent; the storage key never leaves the API.
export const toInstantPhotoFileResponse = (
    view: InstantPhotoFileView,
): StreamableFile =>
    new StreamableFile(view.content, {
        type: view.contentType,
        length: view.content.length,
    });
