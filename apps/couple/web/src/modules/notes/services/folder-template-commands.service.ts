import 'server-only';
import {
    createFolderNameFormSchema,
    type ProposeFolderTemplateUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import type { FolderTemplateProposalResponse } from '@cocooning/couple-contract/notes';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { NoteLocationSchema } from './note-location.zod';

export type ProposeFolderTemplateContext = {
    readonly t: Translator;
    readonly proposeFolderTemplate: ProposeFolderTemplateUseCase;
};

// R17: the AI proposes the subject and the fields from the name; the name and the place are validated again here
// (core-frontend.md rule 14).
export async function proposeFolderTemplate(
    input: unknown,
    destinationInput: unknown,
    context: ProposeFolderTemplateContext,
): Promise<Result<FolderTemplateProposalResponse, ApiError>> {
    const form = createFolderNameFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid folder name form'));
    const destination = NoteLocationSchema.safeParse(destinationInput);
    if (!destination.success) return fail(invalid('Invalid folder place'));
    return context.proposeFolderTemplate.execute(form.data, {
        space: destination.data.space,
        parentFolderId: destination.data.folderId,
    });
}
