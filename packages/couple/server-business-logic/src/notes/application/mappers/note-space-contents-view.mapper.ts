import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../../domain/models/folder.aggregate';
import type { FolderPathItem } from '../../domain/models/folder-path-item';
import type { Note } from '../../domain/models/note.aggregate';
import { type FolderView, toFolderView } from './folder-view.mapper';
import { type NoteView, toNoteView } from './note-view.mapper';

export type FolderEntryView = FolderView & {
    readonly folderCount: number;
    readonly noteCount: number;
};

export type NoteSpaceContentsView = {
    readonly space: NoteSpace;
    readonly path: ReadonlyArray<FolderPathItem>;
    readonly folders: ReadonlyArray<FolderEntryView>;
    readonly notes: ReadonlyArray<NoteView>;
};

export type NoteSpaceContents = {
    readonly space: NoteSpace;
    readonly path: ReadonlyArray<FolderPathItem>;
    readonly folders: ReadonlyArray<Folder>;
    readonly folderCounts: ReadonlyMap<string, number>;
    readonly noteCounts: ReadonlyMap<string, number>;
    readonly notes: ReadonlyArray<Note>;
};

// A folder absent from a grouped count holds nothing of that kind.
const countOf = (counts: ReadonlyMap<string, number>, folder: Folder): number =>
    counts.get(folder.id.getValue()) ?? 0;

export const toNoteSpaceContentsView = (
    contents: NoteSpaceContents,
    readerId: string,
): NoteSpaceContentsView => ({
    space: contents.space,
    path: contents.path,
    folders: contents.folders.map((folder) => ({
        ...toFolderView(folder),
        folderCount: countOf(contents.folderCounts, folder),
        noteCount: countOf(contents.noteCounts, folder),
    })),
    notes: contents.notes.map((note) => toNoteView(note, readerId)),
});
