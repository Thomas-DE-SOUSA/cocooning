import type {
    CreateNoteRequest,
    NotePageResponse,
    NoteResponse,
    RenameNoteRequest,
} from '@cocooning/couple-contract/notes';
import type { OffsetPaginationQuery } from '@cocooning/couple-contract/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// Every call acts for the signed-in partner: the adapter forwards the session (decision 0036), the API finds the couple (decision 0041).
export abstract class NotesGateway {
    abstract listNotes(
        query: OffsetPaginationQuery,
    ): Promise<Result<NotePageResponse, ApiError>>;
    abstract createNote(
        request: CreateNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>>;
    abstract renameNote(
        noteId: string,
        request: RenameNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>>;
    abstract shareNote(noteId: string): Promise<Result<NoteResponse, ApiError>>;
    abstract makeNotePrivate(
        noteId: string,
    ): Promise<Result<NoteResponse, ApiError>>;
    abstract deleteNote(noteId: string): Promise<Result<null, ApiError>>;
}
