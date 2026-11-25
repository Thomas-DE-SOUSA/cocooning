import type {
    NoteSpace,
    NoteVisibility,
} from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { FolderId } from '../value-objects/folder-id.vo';
import type { NoteId } from '../value-objects/note-id.vo';
import type { NoteTitle } from '../value-objects/note-title.vo';
import type { FolderPlace } from './folder.aggregate.type';

export type NoteProps = {
    readonly id: NoteId;
    readonly coupleId: string;
    readonly ownerId: string;
    title: NoteTitle;
    visibility: NoteVisibility;
    folderId: FolderId | null;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateNoteInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: NoteTitle;
    readonly space: NoteSpace;
    readonly folder: FolderPlace | null;
};

export type NoteSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly visibility: NoteVisibility;
    readonly folderId: string | null;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
