'use server';

import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_CARD_NAMESPACE } from '../data/note-card-i18n-namespaces';
import { addNoteCard } from '../services/note-card-commands.service';
import { notesModule } from '../services/notes-module.factory';

// R19, R20: the note exists at once, its card « en recherche »; the page reads the folder again (decision 0036).
export async function notesCardAddAction(
    folderId: string,
    input: NoteCardNameForm,
): Promise<Result<null, ApiError>> {
    return addNoteCard(folderId, input, {
        t: await getServerTranslation(NOTE_CARD_NAMESPACE),
        addNoteCard: notesModule().addNoteCard,
    });
}
