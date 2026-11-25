import 'server-only';
import {
    createFolderNameFormSchema,
    type CreateFolderUseCase,
    type RenameFolderUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { FolderParamsRequestSchema } from '@cocooning/couple-contract/notes';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { NoteLocationSchema } from './note-location.zod';

export type CreateFolderContext = {
    readonly t: Translator;
    readonly createFolder: CreateFolderUseCase;
};

export type RenameFolderContext = {
    readonly t: Translator;
    readonly renameFolder: RenameFolderUseCase;
};

export type FolderUseCaseCall = (
    folderId: string,
) => Promise<Result<unknown, ApiError>>;

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

// R14, R16: either partner acts on a folder they see; its id comes from the browser and is validated again.
export async function actOnFolder(
    input: unknown,
    call: FolderUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = FolderParamsRequestSchema.safeParse({ folderId: input });
    if (!params.success) return fail(invalid('Invalid folder id'));
    const result = await call(params.data.folderId);
    return result.success ? ok(null) : result;
}

export async function renameFolder(
    folderIdInput: unknown,
    input: unknown,
    context: RenameFolderContext,
): Promise<Result<null, ApiError>> {
    const form = createFolderNameFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid folder name form'));
    return actOnFolder(folderIdInput, (folderId) =>
        context.renameFolder.execute(folderId, form.data),
    );
}
