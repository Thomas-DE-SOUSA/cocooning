'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { refreshNoteCard } from '../services/note-card-fields.service';
import { notesModule } from '../services/notes-module.factory';

// R22: « Mettre à jour »; the page reads the card again (decision 0036).
export async function notesCardRefreshAction(
    noteId: string,
): Promise<Result<null, ApiError>> {
    return refreshNoteCard(noteId, notesModule().refreshNoteCard);
}
