import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteDetailResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { notesModule } from './notes-module.factory';

// Read by the page of a list with the session cookie of the request (decision 0036): a list is a note (R26).
export function loadNoteList(
    noteId: string,
): Promise<Result<NoteDetailResponse, ApiError>> {
    return notesModule().getNote.execute(noteId);
}
