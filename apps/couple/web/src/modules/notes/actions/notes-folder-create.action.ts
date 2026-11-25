'use server';

import type {
    FolderNameForm,
    SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { createFolder } from '../services/folder-commands.service';
import { notesModule } from '../services/notes-module.factory';
import type { NoteLocation } from '../view-models/note-place.view-model';

// R13, R17: a classic or a smart folder; the page reads the place again after router.refresh() (decision 0036).
export async function notesFolderCreateAction(
    input: FolderNameForm | SmartFolderForm,
    destination: NoteLocation,
): Promise<Result<null, ApiError>> {
    return createFolder(input, destination, {
        t: await getServerTranslation(NOTE_SPACE_NAMESPACE),
        createFolder: notesModule().createFolder,
    });
}
