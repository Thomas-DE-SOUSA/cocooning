import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteReading } from '../view-models/note-page.view-model';
import { readNoteWithPlace } from './note-with-place.service';
import { notesModule } from './notes-module.factory';

// Read by the page of a note with the session cookie of the request (decision 0036).
export function loadNote(
    noteId: string,
): Promise<Result<NoteReading, ApiError>> {
    return readNoteWithPlace(noteId, notesModule());
}
