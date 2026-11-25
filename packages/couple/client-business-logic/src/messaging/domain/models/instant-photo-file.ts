import type { InstantPhotoContentType } from '@cocooning/couple-shared-kernel/enums';

// R5: the bytes of a visible photo with the format the API detected when it was sent.
export type InstantPhotoFile = {
    readonly bytes: Uint8Array<ArrayBuffer>;
    readonly contentType: InstantPhotoContentType;
};
