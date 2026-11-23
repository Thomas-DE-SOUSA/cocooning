import type { NoteVisibility } from '@cocooning/couple-shared-kernel/enums';
import type { OffsetPage } from '@cocooning/shared-kernel/domain';
import type { Note } from '../../domain/models/note.aggregate';

export type NoteView = {
    readonly noteId: string;
    readonly ownerId: string;
    readonly isOwner: boolean;
    readonly title: string;
    readonly visibility: NoteVisibility;
    readonly updatedAt: Date;
};

// isOwner tells the reader whether the owner-only actions apply to them (R5, R7).
export const toNoteView = (note: Note, readerId: string): NoteView => ({
    noteId: note.id.getValue(),
    ownerId: note.ownerId,
    isOwner: note.ownerId === readerId,
    title: note.title.value,
    visibility: note.visibility,
    updatedAt: note.updatedAt,
});

export const toNoteViewPage = (
    page: OffsetPage<Note>,
    readerId: string,
): OffsetPage<NoteView> => ({
    ...page,
    items: page.items.map((note) => toNoteView(note, readerId)),
});
