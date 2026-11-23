import 'server-only';
import {
    createNoteTitleFormSchema,
    type CreateNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { NoteParamsRequestSchema } from '@cocooning/couple-contract/notes';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

export type CreateNoteContext = {
    readonly t: Translator;
    readonly createNote: CreateNoteUseCase;
};

export type NoteUseCaseCall = (
    noteId: string,
) => Promise<Result<unknown, ApiError>>;

const invalid = (message: string): ApiError => ({
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message,
    backendCode: null,
});

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here.
export async function createNote(
    input: unknown,
    context: CreateNoteContext,
): Promise<Result<null, ApiError>> {
    const form = createNoteTitleFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalid('Invalid note title form'));
    const note = await context.createNote.execute(form.data);
    return note.success ? ok(null) : note;
}

export async function actOnNote(
    input: unknown,
    call: NoteUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = NoteParamsRequestSchema.safeParse({ noteId: input });
    if (!params.success) return fail(invalid('Invalid note id'));
    const result = await call(params.data.noteId);
    return result.success ? ok(null) : result;
}
