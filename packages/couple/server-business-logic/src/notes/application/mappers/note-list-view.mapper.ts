import type { NoteVisibility } from '@cocooning/couple-shared-kernel/enums';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteList } from '../../domain/value-objects/note-list.vo';

// R28: a list on the home of its section; isOwner tells the reader whether the owner-only actions apply (R5, R7).
export type NoteListView = {
    readonly noteId: string;
    readonly title: string;
    readonly emoji: string | null;
    readonly visibility: NoteVisibility;
    readonly isOwner: boolean;
    readonly openItemCount: number;
    readonly updatedAt: Date;
};

export const toNoteListView = (note: Note, readerId: string): NoteListView => ({
    noteId: note.id.getValue(),
    title: note.title.value,
    emoji: NoteList.snapshotOf(note.list).emoji,
    visibility: note.visibility,
    isOwner: note.ownerId === readerId,
    openItemCount: note.openItemCount,
    updatedAt: note.updatedAt,
});

export const toNoteListViews = (
    notes: ReadonlyArray<Note>,
    readerId: string,
): ReadonlyArray<NoteListView> =>
    notes.map((note) => toNoteListView(note, readerId));
