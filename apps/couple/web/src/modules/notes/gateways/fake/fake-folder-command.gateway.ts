import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { FolderCommandGateway } from '../ports/folder-command.gateway';
import { FakeAnswers } from './fake-answers';
import type { FolderCommandCall } from './folder-command-call';

export class FakeFolderCommandGateway extends FolderCommandGateway {
    readonly answers = new FakeAnswers<FolderCommandCall>();

    override createFolder(
        form: FolderNameForm,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>> {
        return this.answers.answer({
            operation: 'createFolder',
            form,
            destination,
        });
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
