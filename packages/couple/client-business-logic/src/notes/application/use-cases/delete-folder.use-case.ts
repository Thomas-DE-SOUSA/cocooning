import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R16: the folder goes, its notes and sub-folders move up one level.
export class DeleteFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(folderId: string): Promise<Result<null, ApiError>> {
        return this.noteFoldersGateway.deleteFolder(folderId);
    }
}
