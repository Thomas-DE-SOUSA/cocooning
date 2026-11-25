import {
    type InstantPhotoContentType,
    InstantPhotoContentTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';

type BytePattern = {
    readonly offset: number;
    readonly bytes: ReadonlyArray<number>;
};

type Signature = {
    readonly contentType: InstantPhotoContentType;
    readonly patterns: ReadonlyArray<BytePattern>;
};

const ascii = (text: string): ReadonlyArray<number> =>
    [...text].map((character) => character.charCodeAt(0));

// The brands an HEIF file of a phone camera declares in its ftyp box.
const HEIF_BRANDS = [
    'heic',
    'heix',
    'heim',
    'heis',
    'hevc',
    'hevx',
    'mif1',
    'msf1',
];

const SIGNATURES: ReadonlyArray<Signature> = [
    {
        contentType: InstantPhotoContentTypeEnum.JPEG,
        patterns: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
    },
    {
        contentType: InstantPhotoContentTypeEnum.PNG,
        patterns: [
            {
                offset: 0,
                bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
            },
        ],
    },
    {
        contentType: InstantPhotoContentTypeEnum.WEBP,
        patterns: [
            { offset: 0, bytes: ascii('RIFF') },
            { offset: 8, bytes: ascii('WEBP') },
        ],
    },
    ...HEIF_BRANDS.map((brand) => ({
        contentType: InstantPhotoContentTypeEnum.HEIC,
        patterns: [
            { offset: 4, bytes: ascii('ftyp') },
            { offset: 8, bytes: ascii(brand) },
        ],
    })),
];

const matches =
    (content: Uint8Array) =>
    ({ offset, bytes }: BytePattern): boolean =>
        bytes.every((byte, index) => content[offset + index] === byte);

// R3: the format comes from the first bytes of the file, never from the media type the client declares.
export const detectInstantPhotoContentType = (
    content: Uint8Array,
): InstantPhotoContentType | null =>
    SIGNATURES.find(({ patterns }) => patterns.every(matches(content)))
        ?.contentType ?? null;
