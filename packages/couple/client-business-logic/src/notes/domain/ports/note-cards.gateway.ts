import type {
    AddNoteCardRequest,
    ChooseNoteCardCandidateRequest,
    CorrectNoteCardFieldRequest,
    NoteCardResponse,
    NoteDetailResponse,
    RefineNoteCardRequest,
} from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// R19 to R22: the notes of a smart folder and their cards; every call acts for the signed-in partner, like NotesGateway.
export abstract class NoteCardsGateway {
    abstract addNoteCard(
        folderId: string,
        request: AddNoteCardRequest,
    ): Promise<Result<NoteDetailResponse, ApiError>>;
    abstract chooseNoteCardCandidate(
        noteId: string,
        request: ChooseNoteCardCandidateRequest,
    ): Promise<Result<NoteCardResponse, ApiError>>;
    abstract refineNoteCard(
        noteId: string,
        request: RefineNoteCardRequest,
    ): Promise<Result<NoteCardResponse, ApiError>>;
    abstract refreshNoteCard(
        noteId: string,
    ): Promise<Result<NoteCardResponse, ApiError>>;
    abstract correctNoteCardField(
        noteId: string,
        request: CorrectNoteCardFieldRequest,
    ): Promise<Result<NoteCardResponse, ApiError>>;
}
