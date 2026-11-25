import type {
    CreateFolderRequest,
    FolderResponse,
} from '@cocooning/couple-contract/notes';
import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import type { FolderNameForm } from '../schemas/folder-name-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

type FolderDestination = Pick<CreateFolderRequest, 'space' | 'parentFolderId'>;

// R13: a new classic folder at the root of a space or in one of its folders; smart folders (R17) come with their screen.
export class CreateFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        form: FolderNameForm,
        destination: FolderDestination,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.createFolder({
            ...destination,
            ...form,
            kind: FolderKindEnum.CLASSIC,
            subject: null,
            cardTemplate: null,
        });
    }
}
