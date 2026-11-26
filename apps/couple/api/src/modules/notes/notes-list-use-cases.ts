import {
    CreateNoteListUseCase,
    EditNoteListUseCase,
    ListNoteListsUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { notesUseCase } from './notes-use-case.factory';

// The lists of the Lists tab, notes to check (R26 to R28, decision 0058).
export const LIST_USE_CASES = [
    notesUseCase(
        ListNoteListsUseCase,
        (d) => new ListNoteListsUseCase(d.repository),
    ),
    notesUseCase(
        CreateNoteListUseCase,
        (d) => new CreateNoteListUseCase(d.repository, d.clock, d.publishing),
    ),
    notesUseCase(
        EditNoteListUseCase,
        (d) =>
            new EditNoteListUseCase(
                d.repository,
                d.preconditions,
                d.clock,
                d.publishing,
            ),
    ),
];
