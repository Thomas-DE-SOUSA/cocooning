import type {
    CreateFolderRequest,
    FolderResponse,
} from '@cocooning/couple-contract/notes';
import type { FolderNameForm } from '../schemas/folder-name-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

type FolderDestination = Omit<CreateFolderRequest, 'name'>;

// R13: a new folder at the root of a space or in one of its folders.
export class CreateFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        form: FolderNameForm,
        destination: FolderDestination,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.createFolder({
            ...destination,
            ...form,
        });
    }
}
