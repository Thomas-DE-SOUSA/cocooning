import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R7: the owner deletes a note.
export class DeleteNoteUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(noteId: string): Promise<Result<null, ApiError>> {
        return this.notesGateway.deleteNote(noteId);
    }
}
