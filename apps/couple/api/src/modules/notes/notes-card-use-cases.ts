import {
    AddNoteCardUseCase,
    ChooseNoteCardCandidateUseCase,
    CorrectNoteCardFieldUseCase,
    RefineNoteCardUseCase,
    RefreshNoteCardUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { notesUseCase } from './notes-use-case.factory';

const cardAction = <T>(
    token: new (
        ...args: ConstructorParameters<typeof RefineNoteCardUseCase>
    ) => T,
) =>
    notesUseCase(
        token,
        (d) =>
            new token(
                d.cards,
                d.preconditions,
                d.cardPreconditions,
                d.clock,
                d.publishing,
            ),
    );

// The cards of the smart folders (R19 to R22, decision 0054).
export const CARD_USE_CASES = [
    notesUseCase(
        AddNoteCardUseCase,
        (d) =>
            new AddNoteCardUseCase(
                d.repository,
                d.cards,
                d.folderPreconditions,
                d.cardContexts,
                d.unitOfWork,
                d.clock,
                d.publishing,
            ),
    ),
    cardAction(ChooseNoteCardCandidateUseCase),
    cardAction(RefineNoteCardUseCase),
    cardAction(CorrectNoteCardFieldUseCase),
    notesUseCase(
        RefreshNoteCardUseCase,
        (d) =>
            new RefreshNoteCardUseCase(
                d.cards,
                d.preconditions,
                d.cardPreconditions,
                d.cardContexts,
                d.clock,
                d.publishing,
            ),
    ),
];
