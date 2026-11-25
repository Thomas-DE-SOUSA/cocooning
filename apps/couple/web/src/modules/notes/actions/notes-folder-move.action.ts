'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { moveFolder } from '../services/move-commands.service';
import { notesModule } from '../services/notes-module.factory';

// R15: the page reads the place again after router.refresh() (decision 0036).
export async function notesFolderMoveAction(
    folderId: string,
    parentFolderId: string | null,
): Promise<Result<null, ApiError>> {
    return moveFolder(folderId, parentFolderId, notesModule().moveFolder);
}
