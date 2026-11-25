import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import type { FolderNameForm } from '../schemas/folder-name-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';
import type { FolderDestination } from './create-folder.use-case';

// R17: the subject and the fields the AI proposes from the name, corrected before the folder is created.
export class ProposeFolderTemplateUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        form: FolderNameForm,
        destination: FolderDestination,
    ): Promise<Result<FolderTemplateProposalResponse, ApiError>> {
        return this.noteFoldersGateway.proposeFolderTemplate({
            ...destination,
            name: form.name,
        });
    }
}
