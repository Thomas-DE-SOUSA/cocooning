'use server';

import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { renameFolder } from '../services/folder-commands.service';
import { notesModule } from '../services/notes-module.factory';

export async function notesFolderRenameAction(
    folderId: string,
    input: FolderNameForm,
): Promise<Result<null, ApiError>> {
    return renameFolder(folderId, input, {
        t: await getServerTranslation(NOTE_SPACE_NAMESPACE),
        renameFolder: notesModule().renameFolder,
    });
}
