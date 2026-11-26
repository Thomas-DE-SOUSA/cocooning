import type {
    NoteCardResponse,
    NoteDetailResponse,
} from '@cocooning/couple-contract/notes';
import type {
    NoteCardView,
    NoteDetailView,
} from '@cocooning/couple-server-business-logic/notes';
import { toNoteResponse } from './to-note-response.mapper';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toNoteCardResponse = (view: NoteCardView): NoteCardResponse => ({
    noteCardId: view.noteCardId,
    noteId: view.noteId,
    status: view.status,
    query: view.query,
    fields: view.fields.map(({ name, value, isManual }) => ({
        name,
        value,
        isManual,
    })),
    candidates: view.candidates.map(({ label, detail }) => ({ label, detail })),
    sources: [...view.sources],
    searchedAt: view.searchedAt === null ? null : view.searchedAt.toISOString(),
    updatedAt: view.updatedAt.toISOString(),
});

export const toNoteDetailResponse = (
    view: NoteDetailView,
): NoteDetailResponse => ({
    ...toNoteResponse(view),
    card: view.card === null ? null : toNoteCardResponse(view.card),
    listKind: view.listKind,
    emoji: view.emoji,
});
