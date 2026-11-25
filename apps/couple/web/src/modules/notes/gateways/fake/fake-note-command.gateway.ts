import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { NoteCommandGateway } from '../ports/note-command.gateway';
import { FakeAnswers } from './fake-answers';
import type { NoteCommandCall } from './note-command-call';

export class FakeNoteCommandGateway extends NoteCommandGateway {
    readonly answers = new FakeAnswers<NoteCommandCall>();

    override createNote(
        form: NoteTitleForm,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'createNote',
            form,
            destination,
        });
    }

    override renameNote(
        noteId: string,
        form: NoteTitleForm,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({ operation: 'renameNote', noteId, form });
    }

    override shareNote(noteId: string): Promise<Result<null, ApiError>> {
        return this.answers.answer({ operation: 'shareNote', noteId });
    }

    override makeNotePrivate(noteId: string): Promise<Result<null, ApiError>> {
        return this.answers.answer({ operation: 'makeNotePrivate', noteId });
    }

    override deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        return this.answers.answer({ operation: 'deleteNote', noteId });
    }

    override moveNote(
        noteId: string,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'moveNote',
            noteId,
            destination,
        });
    }
}
