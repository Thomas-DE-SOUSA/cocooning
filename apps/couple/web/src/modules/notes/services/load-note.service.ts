import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { notesModule } from './notes-module.factory';

// Read by the page of a note with the session cookie of the request (decision 0036).
export function loadNote(
    noteId: string,
): Promise<Result<NoteResponse, ApiError>> {
    return notesModule().getNote.execute(noteId);
}
