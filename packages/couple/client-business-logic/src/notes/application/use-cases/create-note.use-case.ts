import type {
    CreateNoteRequest,
    NoteResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteTitleForm } from '../schemas/note-title-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

type NoteDestination = Omit<CreateNoteRequest, 'title'>;

// R1, R11, R13: a new note owned by its creator, in the space and folder chosen; it takes the visibility of the space.
export class CreateNoteUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(
        form: NoteTitleForm,
        destination: NoteDestination,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.notesGateway.createNote({ ...destination, ...form });
    }
}
