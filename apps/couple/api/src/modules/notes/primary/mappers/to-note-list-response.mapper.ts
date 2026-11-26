import type {
    NoteListIndexResponse,
    NoteListResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteListView } from '@cocooning/couple-server-business-logic/notes';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toNoteListResponse = (view: NoteListView): NoteListResponse => ({
    noteId: view.noteId,
    title: view.title,
    emoji: view.emoji,
    visibility: view.visibility,
    isOwner: view.isOwner,
    openItemCount: view.openItemCount,
    updatedAt: view.updatedAt.toISOString(),
});

export const toNoteListIndexResponse = (
    views: ReadonlyArray<NoteListView>,
): NoteListIndexResponse => ({ items: views.map(toNoteListResponse) });
