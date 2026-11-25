import type {
    FolderNameForm,
    FolderTemplateForm,
    SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { FolderCommandGateway } from '../ports/folder-command.gateway';

type Answer = Promise<Result<null, ApiError>>;
type Proposal = Promise<Result<FolderTemplateProposalResponse, ApiError>>;

export type FolderCommandActions = {
    readonly createFolder: (
        form: FolderNameForm | SmartFolderForm,
        destination: NoteLocation,
    ) => Answer;
    readonly proposeFolderTemplate: (
        form: FolderNameForm,
        destination: NoteLocation,
    ) => Proposal;
    readonly editFolderTemplate: (
        folderId: string,
        form: FolderTemplateForm,
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
        form: FolderNameForm | SmartFolderForm,
        destination: NoteLocation,
    ): Answer {
        return runServerAction(
            () => this.actions.createFolder(form, destination),
            UNREACHABLE,
        );
    }

    override proposeFolderTemplate(
        form: FolderNameForm,
        destination: NoteLocation,
    ): Proposal {
        return runServerAction(
            () => this.actions.proposeFolderTemplate(form, destination),
            UNREACHABLE,
        );
    }

    override editFolderTemplate(
        folderId: string,
        form: FolderTemplateForm,
    ): Answer {
        return runServerAction(
            () => this.actions.editFolderTemplate(folderId, form),
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
