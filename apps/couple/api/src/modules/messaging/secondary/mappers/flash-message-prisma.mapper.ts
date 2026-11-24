import type { FlashMessage } from '@cocooning/couple-prisma/client';
import type { FlashMessageSnapshot } from '@cocooning/couple-server-business-logic/messaging';
import { toMetadataSnapshot } from './message-metadata-columns';

export type FlashMessageRow = FlashMessage;

export function toFlashMessageSnapshot(
    raw: FlashMessageRow,
): FlashMessageSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        text: raw.text,
        version: raw.version,
        metadata: toMetadataSnapshot(raw),
    };
}
