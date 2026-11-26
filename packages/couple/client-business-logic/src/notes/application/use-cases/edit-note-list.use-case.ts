import type { NoteListResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteListsGateway } from '../../domain/ports/note-lists.gateway';
import type { NoteListDetailsForm } from '../schemas/note-list-form.zod';

// R6, R26: either partner of a shared list changes its title and emoji together; a note that is no list is NOT_FOUND (NOTE_LIST_NOT_FOUND).
export class EditNoteListUseCase {
    constructor(private readonly noteListsGateway: NoteListsGateway) {}

    execute(
        noteId: string,
        form: NoteListDetailsForm,
    ): Promise<Result<NoteListResponse, ApiError>> {
        return this.noteListsGateway.edit(noteId, form);
    }
}
