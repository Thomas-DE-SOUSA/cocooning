import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { NoteCommandGateway } from '../ports/note-command.gateway';
import type { NoteCommandCall } from './note-command-call';

export class FakeNoteCommandGateway extends NoteCommandGateway {
    private outcome: Result<null, ApiError> = ok(null);
    private readonly recordedCalls: NoteCommandCall[] = [];
    private held: Promise<void> | null = null;

    get calls(): readonly NoteCommandCall[] {
        return [...this.recordedCalls];
    }

    givenOutcome(outcome: Result<null, ApiError>): void {
        this.outcome = outcome;
    }

    // The next answers wait until the returned release is called: the spec sees the command still running.
    holdAnswers(): () => void {
        let release: () => void = () => {};
        this.held = new Promise((resolve) => {
            release = resolve;
        });
        return release;
    }

    override createNote(form: NoteTitleForm): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'createNote', form });
    }

    override renameNote(
        noteId: string,
        form: NoteTitleForm,
    ): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'renameNote', noteId, form });
    }

    override shareNote(noteId: string): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'shareNote', noteId });
    }

    override makeNotePrivate(noteId: string): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'makeNotePrivate', noteId });
    }

    override deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'deleteNote', noteId });
    }

    private async answer(
        call: NoteCommandCall,
    ): Promise<Result<null, ApiError>> {
        this.recordedCalls.push(call);
        await this.held;
        return this.outcome;
    }
}
