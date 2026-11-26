import type { NoteListForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { NoteListCommandGateway } from '../ports/note-list-command.gateway';

export type NoteListCommandActions = {
    readonly createList: (
        form: NoteListForm,
    ) => Promise<Result<string, ApiError>>;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Note lists server action unreachable',
    backendCode: null,
};

export class ServerActionNoteListCommandGateway extends NoteListCommandGateway {
    constructor(private readonly actions: NoteListCommandActions) {
        super();
    }

    override createList(form: NoteListForm): Promise<Result<string, ApiError>> {
        return runServerAction(
            () => this.actions.createList(form),
            UNREACHABLE,
        );
    }
}
