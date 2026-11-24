import type { NoteResponse } from '@cocooning/couple-contract/notes';
import type { NoteTitleForm } from '../schemas/note-title-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R6: either partner renames a note they see.
export class RenameNoteUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(
        noteId: string,
        form: NoteTitleForm,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.notesGateway.renameNote(noteId, form);
    }
}
