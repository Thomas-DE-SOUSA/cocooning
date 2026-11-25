'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { chooseNoteCardCandidate } from '../services/note-card-choice.service';
import { notesModule } from '../services/notes-module.factory';

// R19: the card searches the candidate chosen; the page reads it again (decision 0036).
export async function notesCardChooseAction(
    noteId: string,
    candidateIndex: number,
): Promise<Result<null, ApiError>> {
    return chooseNoteCardCandidate(
        noteId,
        candidateIndex,
        notesModule().chooseNoteCardCandidate,
    );
}
