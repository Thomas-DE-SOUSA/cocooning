import type { InstantPhotoContentType } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { InstantPhotoId } from '../value-objects/instant-photo-id.vo';

export type InstantPhotoProps = {
    readonly id: InstantPhotoId;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly contentType: InstantPhotoContentType;
    readonly version: number;
    metadata: EntityMetadata;
};

export type SendInstantPhotoInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly contentType: InstantPhotoContentType;
};

export type InstantPhotoSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly contentType: InstantPhotoContentType;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
