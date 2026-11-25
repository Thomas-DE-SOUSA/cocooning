'use server';

import type { NoteCardFieldForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';
import { correctNoteCardField } from '../services/note-card-fields.service';
import { notesModule } from '../services/notes-module.factory';

// R22: the value of one field written by hand; the page reads the card again (decision 0036).
export async function notesCardCorrectAction(
    noteId: string,
    fieldName: string,
    input: NoteCardFieldForm,
): Promise<Result<null, ApiError>> {
    return correctNoteCardField(noteId, fieldName, input, {
        t: await getServerTranslation(NOTE_CARD_NAMESPACE),
        correctNoteCardField: notesModule().correctNoteCardField,
    });
}
