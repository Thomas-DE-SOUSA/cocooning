import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';

// Where something is read or put: the root of a space when folderId is null.
export type NoteLocation = {
    readonly space: NoteSpace;
    readonly folderId: string | null;
};

export type FolderRef = {
    readonly folderId: string;
    readonly name: string;
};

// A place shown to the partner: the root of a space (folder null) or one of its folders, with its address.
export type NotePlace = {
    readonly space: NoteSpace;
    readonly folder: FolderRef | null;
    readonly href: string;
};
