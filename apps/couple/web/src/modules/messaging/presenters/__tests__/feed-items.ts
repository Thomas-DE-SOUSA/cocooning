import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import {
    InstantPhotoContentTypeEnum,
    MessageFeedItemTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';

const AUTHOR_ID = '01936b2e-7c4a-7000-8000-0000000000a1';

// A word of one partner sent at the given instant, for the scenarios of the feed.
export const aWord = (
    id: string,
    sentAt: string,
    isOwner: boolean,
): MessageFeedItemResponse => ({
    type: MessageFeedItemTypeEnum.FLASH_MESSAGE,
    id,
    ownerId: AUTHOR_ID,
    isOwner,
    sentAt,
    text: `Mot ${id}`,
});

// My photo of the day, sent late when asked (R8).
export const aPhotoOfTheDay = (
    id: string,
    sentAt: string,
    isLate: boolean,
): MessageFeedItemResponse => ({
    type: MessageFeedItemTypeEnum.INSTANT_PHOTO,
    id,
    ownerId: AUTHOR_ID,
    isOwner: true,
    sentAt,
    photoPromptId: '01936b2e-7c4a-7000-8000-0000000000b1',
    isLate,
    isHidden: false,
    contentType: InstantPhotoContentTypeEnum.JPEG,
});
