import type { NoteVisibility } from '@cocooning/couple-shared-kernel/enums';
import type { OffsetPage } from '@cocooning/shared-kernel/domain';
import type { Note } from '../../domain/models/note.aggregate';

export type NoteView = {
    readonly noteId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly visibility: NoteVisibility;
    readonly updatedAt: Date;
};

export const toNoteView = (note: Note): NoteView => ({
    noteId: note.id.getValue(),
    ownerId: note.ownerId,
    title: note.title.value,
    visibility: note.visibility,
    updatedAt: note.updatedAt,
});

export const toNoteViewPage = (
    page: OffsetPage<Note>,
): OffsetPage<NoteView> => ({
    ...page,
    items: page.items.map(toNoteView),
});
