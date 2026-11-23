import type { NoteResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R5: the owner makes a note private.
export class MakeNotePrivateUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(noteId: string): Promise<Result<NoteResponse, ApiError>> {
        return this.notesGateway.makeNotePrivate(noteId);
    }
}
