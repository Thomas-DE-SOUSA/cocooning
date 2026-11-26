import type { NoteListResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteListsGateway } from '../../domain/ports/note-lists.gateway';
import type { NoteListForm } from '../schemas/note-list-form.zod';

// R26: a list of a section, shared or private by its space, owned by its creator; R27: always at the root.
export class CreateNoteListUseCase {
    constructor(private readonly noteListsGateway: NoteListsGateway) {}

    execute(form: NoteListForm): Promise<Result<NoteListResponse, ApiError>> {
        return this.noteListsGateway.create(form);
    }
}
