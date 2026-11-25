import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { NoteCommandGateway } from '../ports/note-command.gateway';

export type NoteAction = (noteId: string) => Promise<Result<null, ApiError>>;

export type NoteCommandActions = {
    readonly createNote: (
        form: NoteTitleForm,
        destination: NoteLocation,
    ) => Promise<Result<null, ApiError>>;
    readonly renameNote: (
        noteId: string,
        form: NoteTitleForm,
    ) => Promise<Result<null, ApiError>>;
    readonly deleteNote: NoteAction;
    readonly moveNote: (
        noteId: string,
        destination: NoteLocation,
    ) => Promise<Result<null, ApiError>>;
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

    override createNote(
        form: NoteTitleForm,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.createNote(form, destination),
            UNREACHABLE,
        );
    }

    override renameNote(
        noteId: string,
        form: NoteTitleForm,
    ): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.renameNote(noteId, form),
            UNREACHABLE,
        );
    }

    override deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.deleteNote(noteId),
            UNREACHABLE,
        );
    }

    override moveNote(
        noteId: string,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.moveNote(noteId, destination),
            UNREACHABLE,
        );
    }
}
