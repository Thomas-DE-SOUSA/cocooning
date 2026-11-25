import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import type { FolderPlace } from '../models/folder.aggregate.type';
import type { FolderPathItem } from '../models/folder-path-item';

const invalidMove = (): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.FOLDER_MOVE_INVALID,
        message: 'A folder stays in its space, out of its own sub-folders',
    });

export class FolderPlacementValidator {
    // R11, R13: a folder belongs to one space; what goes into it goes into that space.
    static ensureInSpace(folder: FolderPlace | null, space: NoteSpace): void {
        if (folder === null || folder.space === space) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            message: 'The folder is not in this space',
        });
    }

    // R15: a folder moves within its space, never into itself nor one of its sub-folders.
    static ensureMovable(
        folderId: string,
        space: NoteSpace,
        parent: FolderPlace | null,
        parentPath: ReadonlyArray<FolderPathItem>,
    ): void {
        if (parent === null) return;
        if (parent.space !== space) throw invalidMove();
        if (parentPath.some((step) => step.folderId === folderId))
            throw invalidMove();
    }
}
