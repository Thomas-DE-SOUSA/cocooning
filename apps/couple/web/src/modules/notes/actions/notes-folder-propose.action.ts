'use server';

import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { proposeFolderTemplate } from '../services/folder-template-commands.service';
import { notesModule } from '../services/notes-module.factory';
import type { NoteLocation } from '../view-models/note-place.view-model';

// R17: the subject and the fields the AI proposes for the smart folder about to be created.
export async function notesFolderProposeAction(
    input: FolderNameForm,
    destination: NoteLocation,
): Promise<Result<FolderTemplateProposalResponse, ApiError>> {
    return proposeFolderTemplate(input, destination, {
        t: await getServerTranslation(NOTE_SPACE_NAMESPACE),
        proposeFolderTemplate: notesModule().proposeFolderTemplate,
    });
}
