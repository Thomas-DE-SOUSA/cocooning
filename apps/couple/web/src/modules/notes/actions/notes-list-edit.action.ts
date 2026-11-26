'use server';

import type { NoteListDetailsForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_LISTS_NAMESPACE } from '../data/note-lists-i18n-namespaces';
import { editNoteList } from '../services/note-list-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesListEditAction(
    noteId: string,
    input: NoteListDetailsForm,
): Promise<Result<null, ApiError>> {
    return editNoteList(noteId, input, {
        t: await getServerTranslation(NOTE_LISTS_NAMESPACE),
        editNoteList: notesModule().editNoteList,
    });
}
