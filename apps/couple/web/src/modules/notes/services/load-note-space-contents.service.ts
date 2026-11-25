import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../view-models/note-place.view-model';
import { notesModule } from './notes-module.factory';

// Read by the page of a space with the session cookie of the request (decision 0036): its folders, its notes, its path.
export function loadNoteSpaceContents(
    location: NoteLocation,
): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
    return notesModule().getNoteSpaceContents.execute(
        location.space,
        location.folderId,
    );
}
