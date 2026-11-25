import type { FolderResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R15: a folder moves within its own space; a null parent is the root of that space.
export class MoveFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        folderId: string,
        parentFolderId: string | null,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.moveFolder(folderId, { parentFolderId });
    }
}
