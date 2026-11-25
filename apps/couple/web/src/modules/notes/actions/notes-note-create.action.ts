'use server';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { createNote } from '../services/note-commands.service';
import { notesModule } from '../services/notes-module.factory';
import type { NoteLocation } from '../view-models/note-place.view-model';

// The page reads the notes again after router.refresh(): the action only says whether it worked (decision 0036).
export async function notesNoteCreateAction(
    input: NoteTitleForm,
    destination: NoteLocation,
): Promise<Result<null, ApiError>> {
    return createNote(input, destination, {
        t: await getServerTranslation(NOTE_SPACE_NAMESPACE),
        createNote: notesModule().createNote,
    });
}
