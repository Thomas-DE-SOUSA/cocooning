import { InstantPhotoContentTypeEnum } from '@cocooning/couple-shared-kernel/enums';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { createInstantPhotoFormSchema } from './instant-photo-form.zod';

const schema = createInstantPhotoFormSchema((key) => `t:${key}`);
type PhotoInput = { readonly contentType: string; readonly size: number };
const A_PHOTO: PhotoInput = {
    contentType: InstantPhotoContentTypeEnum.JPEG,
    size: 2048,
};

const issuesOf = (change: Partial<PhotoInput>) => {
    const result = schema.safeParse({ ...A_PHOTO, ...change });
    return result.success
        ? []
        : result.error.issues.map(({ path, message }) => [
              path.join('.'),
              message,
          ]);
};

describe('Feature: the photo checked before its upload (R3)', () => {
    it.each(Object.values(InstantPhotoContentTypeEnum))(
        'accepts a photo in %s',
        (contentType) => {
            expect(issuesOf({ contentType })).toEqual([]);
        },
    );

    it('accepts the heaviest photo', () => {
        expect(issuesOf({ size: INSTANT_PHOTO_MAX_BYTES })).toEqual([]);
    });

    it.each([
        [
            'another format',
            { contentType: 'image/gif' },
            'contentType',
            'formatInvalid',
        ],
        ['an empty file', { size: 0 }, 'size', 'required'],
        [
            'a photo one byte too heavy',
            { size: INSTANT_PHOTO_MAX_BYTES + 1 },
            'size',
            'tooHeavy',
        ],
    ])(
        'refuses %s with its translated message (decision 0031)',
        (_label, change, path, type) => {
            expect(issuesOf(change)).toEqual([
                [path, `t:form.photo.errors.${type}`],
            ]);
        },
    );
});
