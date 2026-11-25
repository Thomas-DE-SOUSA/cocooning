import type { NoteCardResponse } from '@cocooning/couple-contract/notes';
import type { NoteCardQueryForm } from '../schemas/note-card-query-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteCardsGateway } from '../../domain/ports/note-cards.gateway';

// R19: « je précise », the card searches again with what the partner typed.
export class RefineNoteCardUseCase {
    constructor(private readonly noteCardsGateway: NoteCardsGateway) {}

    execute(
        noteId: string,
        form: NoteCardQueryForm,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.noteCardsGateway.refineNoteCard(noteId, form);
    }
}
