import type { NoteDetailResponse } from '@cocooning/couple-contract/notes';
import type { NoteCardNameForm } from '../schemas/note-card-name-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteCardsGateway } from '../../domain/ports/note-cards.gateway';

// R19, R20: the name typed in a smart folder becomes a note, its card waits for the search (PENDING).
export class AddNoteCardUseCase {
    constructor(private readonly noteCardsGateway: NoteCardsGateway) {}

    execute(
        folderId: string,
        form: NoteCardNameForm,
    ): Promise<Result<NoteDetailResponse, ApiError>> {
        return this.noteCardsGateway.addNoteCard(folderId, form);
    }
}
