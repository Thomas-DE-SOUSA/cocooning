// R3: the formats of a phone camera, detected from the bytes of the photo, never from what the client declares.
export const InstantPhotoContentTypeEnum = {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp',
    HEIC: 'image/heic',
} as const;

export type InstantPhotoContentType =
    (typeof InstantPhotoContentTypeEnum)[keyof typeof InstantPhotoContentTypeEnum];
