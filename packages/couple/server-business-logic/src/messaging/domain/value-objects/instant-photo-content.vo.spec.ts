import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { InstantPhotoContentTypeEnum } from '@cocooning/couple-shared-kernel/enums';
import { INSTANT_PHOTO_MAX_BYTES } from '@cocooning/couple-shared-kernel/limits';
import { InstantPhotoContent } from './instant-photo-content.vo';

const ascii = (text: string): number[] =>
    [...text].map((character) => character.charCodeAt(0));

const photo = (header: number[], size = 32): Uint8Array => {
    const bytes = new Uint8Array(size);
    bytes.set(header);
    return bytes;
};

const ftyp = (brand: string): number[] => [
    0,
    0,
    0,
    0x18,
    ...ascii('ftyp'),
    ...ascii(brand),
];

const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0];

describe('Feature: the content of an instant photo (R3)', () => {
    describe('Scenario: a photo of the phone camera', () => {
        it.each([
            ['JPEG', JPEG_HEADER, InstantPhotoContentTypeEnum.JPEG],
            [
                'PNG',
                [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
                InstantPhotoContentTypeEnum.PNG,
            ],
            [
                'WebP',
                [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')],
                InstantPhotoContentTypeEnum.WEBP,
            ],
            [
                'HEIC of an iPhone',
                ftyp('heic'),
                InstantPhotoContentTypeEnum.HEIC,
            ],
            ['generic HEIF', ftyp('mif1'), InstantPhotoContentTypeEnum.HEIC],
        ])(
            'recognises %s by its first bytes',
            (_label, header, contentType) => {
                const bytes = photo(header);
                const content = InstantPhotoContent.create(bytes);
                expect(content.contentType).toBe(contentType);
                expect(content.bytes).toBe(bytes);
            },
        );

        it('accepts exactly INSTANT_PHOTO_MAX_BYTES', () => {
            const bytes = photo(JPEG_HEADER, INSTANT_PHOTO_MAX_BYTES);
            expect(InstantPhotoContent.create(bytes).bytes).toHaveLength(
                INSTANT_PHOTO_MAX_BYTES,
            );
        });
    });

    describe('Scenario: a file that is not an accepted photo', () => {
        it.each([
            ['an empty file', photo([], 0)],
            ['a GIF', photo(ascii('GIF89a'))],
            [
                'a RIFF that is not WebP',
                photo([...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WAVE')]),
            ],
            ['an MP4 video', photo(ftyp('isom'))],
            ['a truncated JPEG', photo([0xff, 0xd8], 2)],
            [
                'one byte too many',
                photo(JPEG_HEADER, INSTANT_PHOTO_MAX_BYTES + 1),
            ],
        ])('refuses %s', (_label, bytes) => {
            expect(() => InstantPhotoContent.create(bytes)).toThrow(
                expect.objectContaining({
                    code: MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID,
                    context: { max: INSTANT_PHOTO_MAX_BYTES },
                }),
            );
        });
    });
});
