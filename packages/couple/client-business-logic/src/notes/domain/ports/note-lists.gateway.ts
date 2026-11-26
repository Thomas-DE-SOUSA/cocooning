import type {
    CreateNoteListRequest,
    EditNoteListRequest,
    NoteListIndexResponse,
    NoteListResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// R26, R28: the lists of the Lists tab; every call acts for the signed-in partner, like NotesGateway (decisions 0036, 0041).
export abstract class NoteListsGateway {
    abstract listOf(
        kind: NoteListKind,
    ): Promise<Result<NoteListIndexResponse, ApiError>>;
    abstract create(
        request: CreateNoteListRequest,
    ): Promise<Result<NoteListResponse, ApiError>>;
    abstract edit(
        noteId: string,
        request: EditNoteListRequest,
    ): Promise<Result<NoteListResponse, ApiError>>;
}
