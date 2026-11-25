import type {
    CreateFolderRequest,
    FolderResponse,
} from '@cocooning/couple-contract/notes';
import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import type { FolderNameForm } from '../schemas/folder-name-form.zod';
import type { SmartFolderForm } from '../schemas/folder-template-form.zod';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

export type FolderDestination = Pick<
    CreateFolderRequest,
    'space' | 'parentFolderId'
>;

const isSmartFolderForm = (
    form: FolderNameForm | SmartFolderForm,
): form is SmartFolderForm => 'fields' in form;

const settingsOf = (form: FolderNameForm | SmartFolderForm) =>
    isSmartFolderForm(form)
        ? {
              kind: FolderKindEnum.SMART,
              subject: form.subject,
              cardTemplate: form.fields,
          }
        : { kind: FolderKindEnum.CLASSIC, subject: null, cardTemplate: null };

// R13: a classic folder from its name alone. R17: a smart one with its subject and fields.
// R18: a classic folder created inside a smart folder becomes smart on the API side.
export class CreateFolderUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        form: FolderNameForm | SmartFolderForm,
        destination: FolderDestination,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.noteFoldersGateway.createFolder({
            ...destination,
            name: form.name,
            ...settingsOf(form),
        });
    }
}
