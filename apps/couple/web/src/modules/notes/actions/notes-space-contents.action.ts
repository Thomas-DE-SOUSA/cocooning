'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { notesModule } from '../services/notes-module.factory';
import { readNoteSpaceContents } from '../services/note-space-contents.service';
import type { NoteLocation } from '../view-models/note-place.view-model';

// The move picker reads the places it walks on demand; the first one comes from the server page (decision 0036).
export async function notesSpaceContentsAction(
    location: NoteLocation,
): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
    return readNoteSpaceContents(location, notesModule().getNoteSpaceContents);
}
