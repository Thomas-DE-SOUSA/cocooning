import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { FolderCommandGateway } from '../ports/folder-command.gateway';

type Answer = Promise<Result<null, ApiError>>;

export type FolderCommandActions = {
    readonly createFolder: (
        form: FolderNameForm,
        destination: NoteLocation,
    ) => Answer;
    readonly renameFolder: (folderId: string, form: FolderNameForm) => Answer;
    readonly deleteFolder: (folderId: string) => Answer;
    readonly moveFolder: (
        folderId: string,
        parentFolderId: string | null,
    ) => Answer;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Folders server action unreachable',
    backendCode: null,
};

export class ServerActionFolderCommandGateway extends FolderCommandGateway {
    constructor(private readonly actions: FolderCommandActions) {
        super();
    }

    override createFolder(
        form: FolderNameForm,
        destination: NoteLocation,
    ): Answer {
        return runServerAction(
            () => this.actions.createFolder(form, destination),
            UNREACHABLE,
        );
    }

    override renameFolder(folderId: string, form: FolderNameForm): Answer {
        return runServerAction(
            () => this.actions.renameFolder(folderId, form),
            UNREACHABLE,
        );
    }

    override deleteFolder(folderId: string): Answer {
        return runServerAction(
            () => this.actions.deleteFolder(folderId),
            UNREACHABLE,
        );
    }

    override moveFolder(
        folderId: string,
        parentFolderId: string | null,
    ): Answer {
        return runServerAction(
            () => this.actions.moveFolder(folderId, parentFolderId),
            UNREACHABLE,
        );
    }
}
