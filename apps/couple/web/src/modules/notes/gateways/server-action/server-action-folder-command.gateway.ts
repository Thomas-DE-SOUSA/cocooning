import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { FolderCommandGateway } from '../ports/folder-command.gateway';

export type FolderCommandActions = {
    readonly createFolder: (
        form: FolderNameForm,
        destination: NoteLocation,
    ) => Promise<Result<null, ApiError>>;
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
    ): Promise<Result<null, ApiError>> {
        return runServerAction(
            () => this.actions.createFolder(form, destination),
            UNREACHABLE,
        );
    }
}
