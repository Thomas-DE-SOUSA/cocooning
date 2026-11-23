'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { actOnNote } from '../services/note-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesNoteShareAction(
    noteId: string,
): Promise<Result<null, ApiError>> {
    const { shareNote } = notesModule();
    return actOnNote(noteId, (id) => shareNote.execute(id));
}
