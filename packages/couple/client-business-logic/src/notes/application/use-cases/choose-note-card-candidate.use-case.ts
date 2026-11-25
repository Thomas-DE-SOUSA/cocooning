import type { NoteCardResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteCardsGateway } from '../../domain/ports/note-cards.gateway';

// R19: the partner picks one of the candidates a CHOOSING card shows, by its position.
export class ChooseNoteCardCandidateUseCase {
    constructor(private readonly noteCardsGateway: NoteCardsGateway) {}

    execute(
        noteId: string,
        candidateIndex: number,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.noteCardsGateway.chooseNoteCardCandidate(noteId, {
            candidateIndex,
        });
    }
}
