import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';

// R13 to R16: the commands on the folders of a space, sent by server actions.
export abstract class FolderCommandGateway {
    abstract createFolder(
        form: FolderNameForm,
        destination: NoteLocation,
    ): Promise<Result<null, ApiError>>;
    abstract renameFolder(
        folderId: string,
        form: FolderNameForm,
    ): Promise<Result<null, ApiError>>;
    abstract deleteFolder(folderId: string): Promise<Result<null, ApiError>>;
    abstract moveFolder(
        folderId: string,
        parentFolderId: string | null,
    ): Promise<Result<null, ApiError>>;
}
