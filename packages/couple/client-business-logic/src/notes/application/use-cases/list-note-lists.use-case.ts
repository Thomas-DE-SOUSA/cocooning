import type { NoteListIndexResponse } from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteListsGateway } from '../../domain/ports/note-lists.gateway';

// R28: the lists of one section the partner sees, with what is left to check, the most recently changed first.
export class ListNoteListsUseCase {
    constructor(private readonly noteListsGateway: NoteListsGateway) {}

    execute(
        kind: NoteListKind,
    ): Promise<Result<NoteListIndexResponse, ApiError>> {
        return this.noteListsGateway.listOf(kind);
    }
}
