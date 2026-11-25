import type { NoteResponse } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import type { NoteTitleForm } from '../schemas/note-title-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R1, R2: a new note, shared and owned by its creator, at the root of « Partagé » until the folders reach the PWA.
export class CreateNoteUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(form: NoteTitleForm): Promise<Result<NoteResponse, ApiError>> {
        return this.notesGateway.createNote({
            ...form,
            space: NoteSpaceEnum.SHARED,
            folderId: null,
        });
    }
}
