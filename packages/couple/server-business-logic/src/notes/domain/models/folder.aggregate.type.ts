import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { FolderId } from '../value-objects/folder-id.vo';
import type { FolderName } from '../value-objects/folder-name.vo';

export type FolderProps = {
    readonly id: FolderId;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly space: NoteSpace;
    parentFolderId: FolderId | null;
    name: FolderName;
    readonly version: number;
    metadata: EntityMetadata;
};

// The parent is the folder already loaded for the partner, or null for the root of the space.
export type CreateFolderInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly space: NoteSpace;
    readonly parent: FolderPlace | null;
    readonly name: FolderName;
};

// What a note or a folder needs to know of the folder it goes into.
export type FolderPlace = {
    readonly id: FolderId;
    readonly space: NoteSpace;
};

export type FolderSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly space: NoteSpace;
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
