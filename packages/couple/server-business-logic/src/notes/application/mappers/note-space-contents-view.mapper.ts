import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Folder } from '../../domain/models/folder.aggregate';
import type { FolderPathItem } from '../../domain/models/folder-path-item';
import type { CardContext } from '../../domain/models/card-context';
import type { NoteCard } from '../../domain/models/note-card.aggregate';
import type { Note } from '../../domain/models/note.aggregate';
import { type FolderView, toFolderView } from './folder-view.mapper';
import {
    type NoteDetailView,
    toNoteDetailViews,
} from './note-detail-view.mapper';

export type FolderEntryView = FolderView & {
    readonly folderCount: number;
    readonly noteCount: number;
};

// R18: the subject and the template the opened folder reads, and the folder that holds them.
export type CardContextView = {
    readonly folderId: string;
    readonly subject: string;
    readonly cardTemplate: ReadonlyArray<string>;
};

export type NoteSpaceContentsView = {
    readonly space: NoteSpace;
    readonly path: ReadonlyArray<FolderPathItem>;
    readonly cardContext: CardContextView | null;
    readonly folders: ReadonlyArray<FolderEntryView>;
    readonly notes: ReadonlyArray<NoteDetailView>;
};

export type NoteSpaceContents = {
    readonly space: NoteSpace;
    readonly path: ReadonlyArray<FolderPathItem>;
    readonly folders: ReadonlyArray<Folder>;
    readonly folderCounts: ReadonlyMap<string, number>;
    readonly noteCounts: ReadonlyMap<string, number>;
    readonly notes: ReadonlyArray<Note>;
    readonly cards: ReadonlyArray<NoteCard>;
    readonly cardContext: CardContext | null;
};

const toCardContextView = (
    context: CardContext | null,
): CardContextView | null =>
    context === null
        ? null
        : {
              folderId: context.holder.id.getValue(),
              subject: context.settings.subject.value,
              cardTemplate: context.settings.template.fieldNames,
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
    cardContext: toCardContextView(contents.cardContext),
    folders: contents.folders.map((folder) => ({
        ...toFolderView(folder),
        folderCount: countOf(contents.folderCounts, folder),
        noteCount: countOf(contents.noteCounts, folder),
    })),
    notes: toNoteDetailViews(contents.notes, contents.cards, readerId),
});
