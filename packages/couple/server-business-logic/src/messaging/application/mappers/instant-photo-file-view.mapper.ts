import type { InstantPhotoContentType } from '@cocooning/couple-shared-kernel/enums';
import type { StoredFile } from '@cocooning/shared-kernel/ports';
import type { InstantPhoto } from '../../domain/models/instant-photo.aggregate';

export type InstantPhotoFileView = {
    readonly content: Uint8Array;
    readonly contentType: InstantPhotoContentType;
};

// The content type comes from the aggregate, detected from the bytes when the photo was sent (R3).
export const toInstantPhotoFileView = (
    instantPhoto: InstantPhoto,
    file: StoredFile,
): InstantPhotoFileView => ({
    content: file.content,
    contentType: instantPhoto.contentType,
});
