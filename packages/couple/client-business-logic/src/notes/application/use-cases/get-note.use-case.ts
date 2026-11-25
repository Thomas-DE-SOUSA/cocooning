import type { NoteDetailResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R4: the note opened from the list, with its card in a smart folder (R20); the private note of the other is NOT_FOUND.
export class GetNoteUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(noteId: string): Promise<Result<NoteDetailResponse, ApiError>> {
        return this.notesGateway.getNote(noteId);
    }
}
