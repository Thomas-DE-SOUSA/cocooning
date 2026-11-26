import type {
    NoteListDetailsForm,
    NoteListForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';

// The commands of the Lists tab; a created list answers its id, to be opened at once.
export abstract class NoteListCommandGateway {
    abstract createList(form: NoteListForm): Promise<Result<string, ApiError>>;
    abstract editList(
        noteId: string,
        form: NoteListDetailsForm,
    ): Promise<Result<null, ApiError>>;
    abstract deleteList(noteId: string): Promise<Result<null, ApiError>>;
}
