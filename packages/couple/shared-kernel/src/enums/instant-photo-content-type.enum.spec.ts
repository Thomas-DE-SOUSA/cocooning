import { InstantPhotoContentTypeEnum } from './instant-photo-content-type.enum';

describe('Feature: the formats of an instant photo (R3)', () => {
    describe('Scenario: listing the formats', () => {
        it('accepts JPEG, PNG, WebP and HEIC, by their media type', () => {
            expect(InstantPhotoContentTypeEnum).toEqual({
                JPEG: 'image/jpeg',
                PNG: 'image/png',
                WEBP: 'image/webp',
                HEIC: 'image/heic',
            });
        });
    });
});
