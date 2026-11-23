import type { NoteVisibility } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { NoteId } from '../value-objects/note-id.vo';
import type { NoteTitle } from '../value-objects/note-title.vo';

export type NoteProps = {
    readonly id: NoteId;
    readonly coupleId: string;
    readonly ownerId: string;
    title: NoteTitle;
    visibility: NoteVisibility;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateNoteInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: NoteTitle;
};

export type NoteSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly visibility: NoteVisibility;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
