'use server';

import type { NoteListForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_LISTS_NAMESPACE } from '../data/note-lists-i18n-namespaces';
import { createNoteList } from '../services/note-list-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesListCreateAction(
    input: NoteListForm,
): Promise<Result<string, ApiError>> {
    return createNoteList(input, {
        t: await getServerTranslation(NOTE_LISTS_NAMESPACE),
        createNoteList: notesModule().createNoteList,
    });
}
