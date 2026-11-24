import {
    type InstantPhotoContentType,
    InstantPhotoContentTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';

const CONTENT_TYPES: ReadonlyArray<string> = Object.values(
    InstantPhotoContentTypeEnum,
);

// R3: one of the formats of a phone camera.
export const isInstantPhotoContentType = (
    value: string,
): value is InstantPhotoContentType => CONTENT_TYPES.includes(value);
