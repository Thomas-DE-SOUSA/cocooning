'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { actOnNote } from '../services/note-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesNoteMakePrivateAction(
    noteId: string,
): Promise<Result<null, ApiError>> {
    const { makeNotePrivate } = notesModule();
    return actOnNote(noteId, (id) => makeNotePrivate.execute(id));
}
