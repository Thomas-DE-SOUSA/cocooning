import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { FlashMessageId } from '../value-objects/flash-message-id.vo';
import type { FlashMessageText } from '../value-objects/flash-message-text.vo';

export type FlashMessageProps = {
    readonly id: FlashMessageId;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly text: FlashMessageText;
    readonly version: number;
    metadata: EntityMetadata;
};

export type SendFlashMessageInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly text: FlashMessageText;
};

export type FlashMessageSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly text: string;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
