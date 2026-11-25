import 'server-only';
import {
    type CorrectNoteCardFieldUseCase,
    createNoteCardFieldFormSchema,
    type RefreshNoteCardUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { CardFieldNameSchema } from '@cocooning/couple-contract/notes';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { actOnNoteCard } from './note-card-commands.service';

export type CorrectNoteCardFieldContext = {
    readonly t: Translator;
    readonly correctNoteCardField: CorrectNoteCardFieldUseCase;
};

// R22, R25: « Mettre à jour » searches the fields again and keeps those corrected by hand.
export function refreshNoteCard(
    noteIdInput: unknown,
    refresh: RefreshNoteCardUseCase,
): Promise<Result<null, ApiError>> {
    return actOnNoteCard(noteIdInput, (noteId) => refresh.execute(noteId));
}

// R22: the value written by hand in one field; the field name and the value are validated again here.
export function correctNoteCardField(
    noteIdInput: unknown,
    fieldNameInput: unknown,
    input: unknown,
    context: CorrectNoteCardFieldContext,
): Promise<Result<null, ApiError>> {
    const fieldName = CardFieldNameSchema.safeParse(fieldNameInput);
    const form = createNoteCardFieldFormSchema(context.t).safeParse(input);
    if (!fieldName.success || !form.success) {
        return Promise.resolve(fail(invalid('Invalid note card field form')));
    }
    return actOnNoteCard(noteIdInput, (noteId) =>
        context.correctNoteCardField.execute(noteId, fieldName.data, form.data),
    );
}
