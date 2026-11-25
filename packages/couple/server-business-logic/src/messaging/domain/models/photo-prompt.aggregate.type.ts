import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { PhotoPromptId } from '../value-objects/photo-prompt-id.vo';

export type PhotoPromptProps = {
    readonly id: PhotoPromptId;
    readonly coupleId: string;
    readonly day: string;
    readonly scheduledAt: Date;
    issuedAt: Date | null;
    readonly version: number;
    metadata: EntityMetadata;
};

export type DrawPhotoPromptInput = {
    readonly coupleId: string;
    readonly day: string;
};

// day is the Paris day YYYY-MM-DD; scheduledAt the drawn instant, secret until issuedAt is set.
export type PhotoPromptSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly day: string;
    readonly scheduledAt: string;
    readonly issuedAt: string | null;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
