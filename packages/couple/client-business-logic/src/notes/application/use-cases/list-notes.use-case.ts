import type { NotePageResponse } from '@cocooning/couple-contract/notes';
import type { OffsetPaginationQuery } from '@cocooning/couple-contract/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NotesGateway } from '../../domain/ports/notes.gateway';

// R4: the shared notes of the couple and the partner's own private notes, one page (decision 0025).
export class ListNotesUseCase {
    constructor(private readonly notesGateway: NotesGateway) {}

    execute(
        query: OffsetPaginationQuery,
    ): Promise<Result<NotePageResponse, ApiError>> {
        return this.notesGateway.listNotes(query);
    }
}
