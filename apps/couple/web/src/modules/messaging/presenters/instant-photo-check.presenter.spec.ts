import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { presentInstantPhotoRefusalKey } from './instant-photo-check.presenter';

describe('Feature: the size of a photo checked on the phone (R3)', () => {
    it.each([
        ['an empty photo', 0, 'form.photo.errors.required'],
        ['a photo of 10 MB', INSTANT_PHOTO_MAX_BYTES, null],
        [
            'a photo over 10 MB',
            INSTANT_PHOTO_MAX_BYTES + 1,
            'form.photo.errors.tooHeavy',
        ],
        ['a photo of 2 MB', 2_000_000, null],
    ])('answers %s with %p', (_label, size, expected) => {
        expect(presentInstantPhotoRefusalKey(size)).toBe(expected);
    });
});
