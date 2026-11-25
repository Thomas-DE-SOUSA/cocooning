import type {
    FolderNameForm,
    SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { A_PROPOSED_TEMPLATE } from '@cocooning/couple-client-business-logic/testing';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { FolderCommandGateway } from '../ports/folder-command.gateway';
import { FakeAnswers } from './fake-answers';
import type { FolderCommandCall } from './folder-command-call';

// A refused outcome refuses the proposal too; otherwise the proposal is A_PROPOSED_TEMPLATE.
export class FakeFolderCommandGateway extends FolderCommandGateway {
    readonly answers = new FakeAnswers<FolderCommandCall>();

    override createFolder(
        form: FolderNameForm | SmartFolderForm,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'createFolder',
            form,
            destination,
        });
    }

    override async proposeFolderTemplate(
        form: FolderNameForm,
        destination: NoteLocation,
    ): Promise<Result<FolderTemplateProposalResponse, ApiError>> {
        const answer = await this.answers.answer({
            operation: 'proposeFolderTemplate',
            form,
            destination,
        });
        return answer.success ? ok(A_PROPOSED_TEMPLATE) : answer;
    }

    override renameFolder(
        folderId: string,
        form: FolderNameForm,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'renameFolder',
            folderId,
            form,
        });
    }

    override deleteFolder(folderId: string): Promise<Result<null, ApiError>> {
        return this.answers.answer({ operation: 'deleteFolder', folderId });
    }

    override moveFolder(
        folderId: string,
        parentFolderId: string | null,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'moveFolder',
            folderId,
            parentFolderId,
        });
    }
}
