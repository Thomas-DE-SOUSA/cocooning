import type {
    MessageFeedItemResponse,
    MessageFeedPageResponse,
    PushPublicKeyResponse,
    SubscribePushNotificationsRequest,
    TodayPhotoPromptResponse,
} from '@cocooning/couple-contract/messaging';
import {
    InstantPhotoContentTypeEnum,
    MessageFeedItemTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { InstantPhotoFile } from '../messaging/domain/models/instant-photo-file';
import type { InstantPhotoUpload } from '../messaging/domain/models/instant-photo-upload';

const AUTHOR_ID = '01936b2e-7c4a-7000-8000-0000000000a1';
const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0];

export const A_FLASH_MESSAGE: MessageFeedItemResponse = {
    type: MessageFeedItemTypeEnum.FLASH_MESSAGE,
    id: '01936b2e-7c4a-7000-8000-0000000000f1',
    ownerId: AUTHOR_ID,
    isOwner: true,
    sentAt: '2026-11-24T18:00:00.000Z',
    text: 'Je t aime',
};

export const AN_INSTANT_PHOTO: MessageFeedItemResponse = {
    type: MessageFeedItemTypeEnum.INSTANT_PHOTO,
    id: '01936b2e-7c4a-7000-8000-0000000000f2',
    ownerId: AUTHOR_ID,
    isOwner: true,
    sentAt: '2026-11-24T18:05:00.000Z',
    photoPromptId: null,
    isLate: false,
    isHidden: false,
    contentType: InstantPhotoContentTypeEnum.JPEG,
};

export const A_PHOTO_PROMPT_ID = '01936b2e-7c4a-7000-8000-0000000000b1';

// R9: the partner's photo of the day, before the reader sent theirs.
export const A_HIDDEN_PHOTO_OF_THE_DAY: MessageFeedItemResponse = {
    type: MessageFeedItemTypeEnum.INSTANT_PHOTO,
    id: '01936b2e-7c4a-7000-8000-0000000000f3',
    ownerId: '01936b2e-7c4a-7000-8000-0000000000a2',
    isOwner: false,
    sentAt: '2026-11-24T14:02:00.000Z',
    photoPromptId: A_PHOTO_PROMPT_ID,
    isLate: false,
    isHidden: true,
};

export const A_MESSAGE_FEED_PAGE: MessageFeedPageResponse = {
    items: [AN_INSTANT_PHOTO, A_FLASH_MESSAGE, A_HIDDEN_PHOTO_OF_THE_DAY],
    nextCursor: null,
};

export const AN_INSTANT_PHOTO_UPLOAD: InstantPhotoUpload = {
    bytes: new Uint8Array(JPEG_BYTES),
    contentType: InstantPhotoContentTypeEnum.JPEG,
    fileName: 'photo.jpg',
};

export const AN_INSTANT_PHOTO_FILE: InstantPhotoFile = {
    bytes: new Uint8Array(JPEG_BYTES),
    contentType: InstantPhotoContentTypeEnum.JPEG,
};

export const A_TODAY_PHOTO_PROMPT: TodayPhotoPromptResponse = {
    photoPrompt: {
        id: A_PHOTO_PROMPT_ID,
        issuedAt: '2026-11-24T14:00:00.000Z',
        lateFrom: '2026-11-24T14:10:00.000Z',
        closesAt: '2026-11-24T23:00:00.000Z',
        myInstantPhotoId: null,
        isAnsweredByPartner: true,
    },
};

export const A_PUSH_SUBSCRIPTION: SubscribePushNotificationsRequest = {
    endpoint: 'https://push.example.test/send/phone-1',
    keys: { p256dh: 'BPhonePublicKey_1', auth: 'PhoneAuthSecret1' },
};

export const A_PUSH_PUBLIC_KEY: PushPublicKeyResponse = {
    publicKey: 'BVapidPublicKey_1',
};
