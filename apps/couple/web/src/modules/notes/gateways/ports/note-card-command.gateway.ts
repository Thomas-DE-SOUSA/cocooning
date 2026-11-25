import type {
    NoteCardFieldForm,
    NoteCardNameForm,
    NoteCardQueryForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

// R19 to R22: the commands on the cards of a smart folder, sent by server actions; the page reads the card again.
export abstract class NoteCardCommandGateway {
    abstract addNoteCard(
        folderId: string,
        form: NoteCardNameForm,
    ): Promise<Result<null, ApiError>>;
    abstract chooseNoteCardCandidate(
        noteId: string,
        candidateIndex: number,
    ): Promise<Result<null, ApiError>>;
    abstract refineNoteCard(
        noteId: string,
        form: NoteCardQueryForm,
    ): Promise<Result<null, ApiError>>;
    abstract refreshNoteCard(noteId: string): Promise<Result<null, ApiError>>;
    abstract correctNoteCardField(
        noteId: string,
        fieldName: string,
        form: NoteCardFieldForm,
    ): Promise<Result<null, ApiError>>;
}
