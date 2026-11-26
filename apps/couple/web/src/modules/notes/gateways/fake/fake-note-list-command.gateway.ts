import type { NoteListForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { NoteListCommandGateway } from '../ports/note-list-command.gateway';

export type NoteListCommandCall = {
    readonly operation: 'createList';
    readonly form: NoteListForm;
};

export const A_CREATED_LIST_ID = '01936b2e-7c4a-7000-8000-0000000000e9';

// Records each command; givenRefusal makes every next one fail.
export class FakeNoteListCommandGateway extends NoteListCommandGateway {
    private readonly recordedCalls: NoteListCommandCall[] = [];
    private refusal: ApiError | null = null;

    get calls(): readonly NoteListCommandCall[] {
        return [...this.recordedCalls];
    }

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override createList(form: NoteListForm): Promise<Result<string, ApiError>> {
        this.recordedCalls.push({ operation: 'createList', form });
        return Promise.resolve(this.answer(A_CREATED_LIST_ID));
    }

    private answer<T>(value: T): Result<T, ApiError> {
        return this.refusal === null ? ok(value) : fail(this.refusal);
    }
}
