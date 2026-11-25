import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import { NoteCardCommandGateway } from '../ports/note-card-command.gateway';

type Answer = Promise<Result<null, ApiError>>;

export type NoteCardCommandActions = {
    readonly addNoteCard: (folderId: string, form: NoteCardNameForm) => Answer;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Note cards server action unreachable',
    backendCode: null,
};

export class ServerActionNoteCardCommandGateway extends NoteCardCommandGateway {
    constructor(private readonly actions: NoteCardCommandActions) {
        super();
    }

    override addNoteCard(folderId: string, form: NoteCardNameForm): Answer {
        return runServerAction(
            () => this.actions.addNoteCard(folderId, form),
            UNREACHABLE,
        );
    }
}
