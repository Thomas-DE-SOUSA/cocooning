'use server';

import type { NoteCardQueryForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';
import { refineNoteCard } from '../services/note-card-choice.service';
import { notesModule } from '../services/notes-module.factory';

// R19: the card searches again with what the partner typed; the page reads it again (decision 0036).
export async function notesCardRefineAction(
    noteId: string,
    input: NoteCardQueryForm,
): Promise<Result<null, ApiError>> {
    return refineNoteCard(noteId, input, {
        t: await getServerTranslation(NOTE_CARD_NAMESPACE),
        refineNoteCard: notesModule().refineNoteCard,
    });
}
