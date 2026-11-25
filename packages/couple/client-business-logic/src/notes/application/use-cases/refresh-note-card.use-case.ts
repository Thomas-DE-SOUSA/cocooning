import type { NoteCardResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteCardsGateway } from '../../domain/ports/note-cards.gateway';

// R20, R22: « Mettre à jour » searches again, keeping the fields corrected by hand.
export class RefreshNoteCardUseCase {
    constructor(private readonly noteCardsGateway: NoteCardsGateway) {}

    execute(noteId: string): Promise<Result<NoteCardResponse, ApiError>> {
        return this.noteCardsGateway.refreshNoteCard(noteId);
    }
}
