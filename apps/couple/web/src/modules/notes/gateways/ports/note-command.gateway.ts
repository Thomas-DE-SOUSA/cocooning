import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

export abstract class NoteCommandGateway {
    abstract createNote(form: NoteTitleForm): Promise<Result<null, ApiError>>;
    abstract renameNote(
        noteId: string,
        form: NoteTitleForm,
    ): Promise<Result<null, ApiError>>;
    abstract shareNote(noteId: string): Promise<Result<null, ApiError>>;
    abstract makeNotePrivate(noteId: string): Promise<Result<null, ApiError>>;
    abstract deleteNote(noteId: string): Promise<Result<null, ApiError>>;
}
