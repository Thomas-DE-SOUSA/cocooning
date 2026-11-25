import type { FolderResponse } from '@cocooning/couple-contract/notes';
import type { FolderNameForm } from '../schemas/folder-name-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R14: either partner renames a folder they see.
export class RenameFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        folderId: string,
        form: FolderNameForm,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.renameFolder(folderId, form);
    }
}
