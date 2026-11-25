import type {
    MoveNoteRequest,
    NoteResponse,
} from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R11: a note goes into a folder or a space root and takes the visibility of its space.
export class MoveNoteUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        noteId: string,
        destination: MoveNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.noteFoldersGateway.moveNote(noteId, destination);
    }
}
