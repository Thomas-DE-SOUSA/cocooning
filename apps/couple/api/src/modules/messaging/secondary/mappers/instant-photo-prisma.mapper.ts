import type { InstantPhoto } from '@cocooning/couple-prisma/client';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import {
    type InstantPhotoSnapshot,
    MessagingException,
} from '@cocooning/couple-server-business-logic/messaging';
import { InstantPhotoContentTypeEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';
import { toMetadataSnapshot } from './message-metadata-columns';

export type InstantPhotoRow = InstantPhoto;

const toContentType = (raw: string) => {
    try {
        return parseEnum(
            raw,
            InstantPhotoContentTypeEnum,
            'InstantPhotoContentType',
        );
    } catch {
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_DATA_CORRUPTED,
            message: 'Unknown instant photo content type',
        });
    }
};

export function toInstantPhotoSnapshot(
    raw: InstantPhotoRow,
): InstantPhotoSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        contentType: toContentType(raw.contentType),
        version: raw.version,
        metadata: toMetadataSnapshot(raw),
    };
}
