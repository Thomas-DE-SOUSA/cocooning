import 'server-only';
import {
    type CreateNoteListUseCase,
    createNoteListDetailsFormSchema,
    createNoteListFormSchema,
    type EditNoteListUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { actOnNote, invalid } from './note-commands.service';

export type CreateNoteListContext = {
    readonly t: Translator;
    readonly createNoteList: CreateNoteListUseCase;
};

export type EditNoteListContext = {
    readonly t: Translator;
    readonly editNoteList: EditNoteListUseCase;
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

// R6, R26: either partner of a shared list changes its title and emoji; both are validated again, like the id.
export async function editNoteList(
    noteIdInput: unknown,
    input: unknown,
    context: EditNoteListContext,
): Promise<Result<null, ApiError>> {
    const form = createNoteListDetailsFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid note list details form'));
    return actOnNote(noteIdInput, (noteId) =>
        context.editNoteList.execute(noteId, form.data),
    );
}
