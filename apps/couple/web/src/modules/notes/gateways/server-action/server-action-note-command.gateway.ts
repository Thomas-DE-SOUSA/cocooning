import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { NoteCommandGateway } from '../ports/note-command.gateway';

export type NoteAction = (noteId: string) => Promise<Result<null, ApiError>>;

export type NoteCommandActions = {
    readonly createNote: (
        form: NoteTitleForm,
    ) => Promise<Result<null, ApiError>>;
    readonly shareNote: NoteAction;
    readonly makeNotePrivate: NoteAction;
    readonly deleteNote: NoteAction;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Notes server action unreachable',
    backendCode: null,
};

export class ServerActionNoteCommandGateway extends NoteCommandGateway {
    constructor(private readonly actions: NoteCommandActions) {
        super();
    }

    override createNote(form: NoteTitleForm): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.createNote(form),
            UNREACHABLE,
        );
    }

    override shareNote(noteId: string): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.shareNote(noteId),
            UNREACHABLE,
        );
    }

    override makeNotePrivate(noteId: string): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.makeNotePrivate(noteId),
            UNREACHABLE,
        );
    }

    override deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.deleteNote(noteId),
            UNREACHABLE,
        );
    }
}
