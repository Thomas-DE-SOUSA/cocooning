import type {
    NoteCardNameForm,
    NoteCardQueryForm,
} from '@cocooning/couple-client-business-logic/notes';
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
    readonly chooseNoteCardCandidate: (
        noteId: string,
        candidateIndex: number,
    ) => Answer;
    readonly refineNoteCard: (
        noteId: string,
        form: NoteCardQueryForm,
    ) => Answer;
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

    override chooseNoteCardCandidate(
        noteId: string,
        candidateIndex: number,
    ): Answer {
        return runServerAction(
            () => this.actions.chooseNoteCardCandidate(noteId, candidateIndex),
            UNREACHABLE,
        );
    }

    override refineNoteCard(noteId: string, form: NoteCardQueryForm): Answer {
        return runServerAction(
            () => this.actions.refineNoteCard(noteId, form),
            UNREACHABLE,
        );
    }
}
