import { InstantPhotoContentTypeEnum } from '@cocooning/couple-shared-kernel/enums';
import { isInstantPhotoContentType } from './instant-photo-content-type';

describe('Feature: the formats of a photo of the phone camera (R3)', () => {
    it.each(Object.values(InstantPhotoContentTypeEnum))(
        'accepts %s',
        (contentType) => {
            expect(isInstantPhotoContentType(contentType)).toBe(true);
        },
    );

    it.each(['image/gif', 'image/heif', 'application/json', ''])(
        'refuses %p',
        (contentType) => {
            expect(isInstantPhotoContentType(contentType)).toBe(false);
        },
    );
});
