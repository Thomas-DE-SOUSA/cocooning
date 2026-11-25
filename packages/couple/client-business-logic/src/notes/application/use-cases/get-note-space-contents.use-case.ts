import type { NoteSpaceContentsResponse } from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { NoteFoldersGateway } from '../../domain/ports/note-folders.gateway';

// R10, R14: the root of a space when the folder is null, otherwise one of its folders.
export class GetNoteSpaceContentsUseCase {
    constructor(private readonly noteFoldersGateway: NoteFoldersGateway) {}

    execute(
        space: NoteSpace,
        folderId: string | null,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
        return this.noteFoldersGateway.getSpaceContents(space, folderId);
    }
}
