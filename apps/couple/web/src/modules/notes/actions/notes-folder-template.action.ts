'use server';

import type { FolderTemplateForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { editFolderTemplate } from '../services/folder-template-commands.service';
import { notesModule } from '../services/notes-module.factory';

// R17, R22: the card template corrected; the cards of the tree follow it and the page reads the place again.
export async function notesFolderTemplateAction(
    folderId: string,
    input: FolderTemplateForm,
): Promise<Result<null, ApiError>> {
    return editFolderTemplate(folderId, input, {
        t: await getServerTranslation(NOTE_SPACE_NAMESPACE),
        editFolderTemplate: notesModule().editFolderTemplate,
    });
}
