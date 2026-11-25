'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { actOnFolder } from '../services/folder-commands.service';
import { notesModule } from '../services/notes-module.factory';

// R16: the folder goes, its notes and sub-folders move up one level.
export async function notesFolderDeleteAction(
    folderId: string,
): Promise<Result<null, ApiError>> {
    const { deleteFolder } = notesModule();
    return actOnFolder(folderId, (id) => deleteFolder.execute(id));
}
