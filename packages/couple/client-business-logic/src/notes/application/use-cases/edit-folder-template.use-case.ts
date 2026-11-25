import type { FolderResponse } from '@cocooning/couple-contract/notes';
import type { FolderTemplateForm } from '../schemas/folder-template-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R17, R18, R22: either partner corrects the subject and the fields, from any folder of the smart tree.
export class EditFolderTemplateUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        folderId: string,
        form: FolderTemplateForm,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.editFolderTemplate(folderId, {
            subject: form.subject,
            cardTemplate: form.fields,
        });
    }
}
