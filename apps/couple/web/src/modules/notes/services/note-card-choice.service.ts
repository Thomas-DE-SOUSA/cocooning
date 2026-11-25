import 'server-only';
import {
    type ChooseNoteCardCandidateUseCase,
    createNoteCardQueryFormSchema,
    type RefineNoteCardUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import type {
    ApiError,
    Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { ChooseNoteCardCandidateRequestSchema } from '@cocooning/couple-contract/notes';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { invalid } from './note-commands.service';
import { actOnNoteCard } from './note-card-commands.service';

export type RefineNoteCardContext = {
    readonly t: Translator;
    readonly refineNoteCard: RefineNoteCardUseCase;
};

// R19: the candidate chosen, by its position among those the card shows (core-frontend.md rule 14).
export function chooseNoteCardCandidate(
    noteIdInput: unknown,
    candidateIndexInput: unknown,
    choose: ChooseNoteCardCandidateUseCase,
): Promise<Result<null, ApiError>> {
    const request = ChooseNoteCardCandidateRequestSchema.safeParse({
        candidateIndex: candidateIndexInput,
    });
    if (!request.success) {
        return Promise.resolve(fail(invalid('Invalid candidate index')));
    }
    return actOnNoteCard(noteIdInput, (noteId) =>
        choose.execute(noteId, request.data.candidateIndex),
    );
}

// R19: « Aucun de ceux-là », the card searches again with what the partner typed.
export function refineNoteCard(
    noteIdInput: unknown,
    input: unknown,
    context: RefineNoteCardContext,
): Promise<Result<null, ApiError>> {
    const form = createNoteCardQueryFormSchema(context.t).safeParse(input);
    if (!form.success) {
        return Promise.resolve(fail(invalid('Invalid note card query form')));
    }
    return actOnNoteCard(noteIdInput, (noteId) =>
        context.refineNoteCard.execute(noteId, form.data),
    );
}
