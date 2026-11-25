import 'server-only';
import {
    type AddNoteCardUseCase,
    createNoteCardNameFormSchema,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import {
    FolderParamsRequestSchema,
    NoteParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';

export type NoteCardUseCaseCall = (
    noteId: string,
) => Promise<Result<unknown, ApiError>>;

export type AddNoteCardContext = {
    readonly t: Translator;
    readonly addNoteCard: AddNoteCardUseCase;
};

// R19: the name typed in a smart folder becomes a note with its card; the name and the folder id are validated again
// here (core-frontend.md rule 14). The page reads the folder again: the answer is dropped.
export async function addNoteCard(
    folderIdInput: unknown,
    input: unknown,
    context: AddNoteCardContext,
): Promise<Result<null, ApiError>> {
    const form = createNoteCardNameFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid note card name form'));
    const params = FolderParamsRequestSchema.safeParse({
        folderId: folderIdInput,
    });
    if (!params.success) return fail(invalid('Invalid folder id'));
    const added = await context.addNoteCard.execute(
        params.data.folderId,
        form.data,
    );
    return added.success ? ok(null) : added;
}

// R19 to R22: either partner acts on the card of a note they see; its id comes from the browser and is validated again.
export async function actOnNoteCard(
    noteIdInput: unknown,
    call: NoteCardUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = NoteParamsRequestSchema.safeParse({ noteId: noteIdInput });
    if (!params.success) return fail(invalid('Invalid note id'));
    const result = await call(params.data.noteId);
    return result.success ? ok(null) : result;
}
