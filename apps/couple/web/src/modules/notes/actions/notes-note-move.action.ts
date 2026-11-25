'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { moveNote } from '../services/move-commands.service';
import { notesModule } from '../services/notes-module.factory';
import type { NoteLocation } from '../view-models/note-place.view-model';

// R11: the page reads the place again after router.refresh() (decision 0036).
export async function notesNoteMoveAction(
    noteId: string,
    destination: NoteLocation,
): Promise<Result<null, ApiError>> {
    return moveNote(noteId, destination, notesModule().moveNote);
}
