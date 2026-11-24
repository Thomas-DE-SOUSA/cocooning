import {
    type InstantPhotoContentType,
    MessageFeedItemTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { FlashMessage } from '../../domain/models/flash-message.aggregate';
import type { InstantPhoto } from '../../domain/models/instant-photo.aggregate';
import type { MessageFeedItem } from '../../domain/models/message-feed-item';

type MessageFeedItemBaseView = {
    readonly id: string;
    readonly ownerId: string;
    readonly isOwner: boolean;
    readonly sentAt: Date;
};

export type FlashMessageView = MessageFeedItemBaseView & {
    readonly type: typeof MessageFeedItemTypeEnum.FLASH_MESSAGE;
    readonly text: string;
};

export type InstantPhotoView = MessageFeedItemBaseView & {
    readonly type: typeof MessageFeedItemTypeEnum.INSTANT_PHOTO;
    readonly contentType: InstantPhotoContentType;
};

export type MessageFeedItemView = FlashMessageView | InstantPhotoView;

// isOwner tells the reader whether they may withdraw the item (R6); the PWA places and colours the author by it (R1, R5).
export const toFlashMessageView = (
    flashMessage: FlashMessage,
    readerId: string,
): FlashMessageView => {
    const { id, ownerId, text } = flashMessage.toSnapshot();
    return {
        type: MessageFeedItemTypeEnum.FLASH_MESSAGE,
        id,
        ownerId,
        isOwner: ownerId === readerId,
        sentAt: flashMessage.sentAt,
        text,
    };
};

export const toInstantPhotoView = (
    instantPhoto: InstantPhoto,
    readerId: string,
): InstantPhotoView => {
    const { id, ownerId, contentType } = instantPhoto.toSnapshot();
    return {
        type: MessageFeedItemTypeEnum.INSTANT_PHOTO,
        id,
        ownerId,
        isOwner: ownerId === readerId,
        sentAt: instantPhoto.sentAt,
        contentType,
    };
};

export const toMessageFeedItemView = (
    item: MessageFeedItem,
    readerId: string,
): MessageFeedItemView =>
    item instanceof FlashMessage
        ? toFlashMessageView(item, readerId)
        : toInstantPhotoView(item, readerId);
