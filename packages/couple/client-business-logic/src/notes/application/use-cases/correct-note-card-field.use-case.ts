import type { NoteCardResponse } from '@cocooning/couple-contract/notes';
import type { NoteCardFieldForm } from '../schemas/note-card-field-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteCardsGateway } from '../../domain/ports/note-cards.gateway';

// R22: the partner writes the value of one field by hand; « Mettre à jour » keeps it.
export class CorrectNoteCardFieldUseCase {
    constructor(private readonly noteCardsGateway: NoteCardsGateway) {}

    execute(
        noteId: string,
        fieldName: string,
        form: NoteCardFieldForm,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.noteCardsGateway.correctNoteCardField(noteId, {
            name: fieldName,
            value: form.value,
        });
    }
}
