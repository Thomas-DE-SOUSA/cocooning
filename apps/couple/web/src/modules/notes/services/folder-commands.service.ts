import 'server-only';
import {
    createFolderNameFormSchema,
    type CreateFolderUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { NoteLocationSchema } from './note-location.zod';

export type CreateFolderContext = {
    readonly t: Translator;
    readonly createFolder: CreateFolderUseCase;
};

// core-frontend.md rule 14: the name and the place are validated again here. R13: at the root of a space or in a folder.
export async function createFolder(
    input: unknown,
    destinationInput: unknown,
    context: CreateFolderContext,
): Promise<Result<null, ApiError>> {
    const form = createFolderNameFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid folder name form'));
    const destination = NoteLocationSchema.safeParse(destinationInput);
    if (!destination.success) return fail(invalid('Invalid folder place'));
    const folder = await context.createFolder.execute(form.data, {
        space: destination.data.space,
        parentFolderId: destination.data.folderId,
    });
    return folder.success ? ok(null) : folder;
}
