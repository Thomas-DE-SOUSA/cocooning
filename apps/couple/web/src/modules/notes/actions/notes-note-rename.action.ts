'use server';

import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_NAMESPACE } from '../data/note-page-i18n-namespaces';
import { renameNote } from '../services/note-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesNoteRenameAction(
    noteId: string,
    input: NoteTitleForm,
): Promise<Result<null, ApiError>> {
    return renameNote(noteId, input, {
        t: await getServerTranslation(NOTE_NAMESPACE),
        renameNote: notesModule().renameNote,
    });
}
