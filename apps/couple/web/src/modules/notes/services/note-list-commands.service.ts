import 'server-only';
import {
    type CreateNoteListUseCase,
    createNoteListFormSchema,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';

export type CreateNoteListContext = {
    readonly t: Translator;
    readonly createNoteList: CreateNoteListUseCase;
};

// core-frontend.md rule 14: the form is validated again here (R8, R26); the new list is opened by its id.
export async function createNoteList(
    input: unknown,
    context: CreateNoteListContext,
): Promise<Result<string, ApiError>> {
    const form = createNoteListFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid note list form'));
    const list = await context.createNoteList.execute(form.data);
    return list.success ? ok(list.value.noteId) : list;
}
