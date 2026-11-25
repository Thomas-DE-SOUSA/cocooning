import type {
    NotePageResponse,
    NoteResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteView } from '@cocooning/couple-server-business-logic/notes';
import type { OffsetPage } from '@cocooning/shared-kernel/domain';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toNoteResponse = (view: NoteView): NoteResponse => ({
    noteId: view.noteId,
    ownerId: view.ownerId,
    isOwner: view.isOwner,
    title: view.title,
    visibility: view.visibility,
    folderId: view.folderId,
    updatedAt: view.updatedAt.toISOString(),
});

export const toNotePageResponse = (
    page: OffsetPage<NoteView>,
): NotePageResponse => ({
    items: page.items.map(toNoteResponse),
    total: page.total,
    page: page.page,
    pageSize: page.pageSize,
});
