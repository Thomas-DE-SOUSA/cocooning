import { Module } from '@nestjs/common';
import {
    AuthorizeNoteDocumentUseCase,
    CreateNoteUseCase,
    DeleteNoteUseCase,
    GetNoteUseCase,
    ListNotesUseCase,
    LoadNoteDocumentUseCase,
    MakeNotePrivateUseCase,
    NoteCoupleGuardService,
    PairedCoupleProvider,
    RenameNoteUseCase,
    SaveNoteDocumentUseCase,
    ShareNoteUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { CARD_USE_CASES } from './notes-card-use-cases';
import { FOLDER_USE_CASES } from './notes-folder-use-cases';
import { NotesSecondaryModule } from './notes-secondary.module';
import { notesUseCase } from './notes-use-case.factory';

const mutation = <T>(
    token: new (...args: ConstructorParameters<typeof RenameNoteUseCase>) => T,
) =>
    notesUseCase(
        token,
        (d) => new token(d.repository, d.preconditions, d.clock, d.publishing),
    );

// R5, R7: a change that withdraws the note disconnects its editors (decision 0040).
const revoking = <T>(
    token: new (
        ...args: ConstructorParameters<typeof MakeNotePrivateUseCase>
    ) => T,
) =>
    notesUseCase(
        token,
        (d) =>
            new token(
                d.repository,
                d.preconditions,
                d.collaboration,
                d.clock,
                d.publishing,
            ),
    );

const useCases = [
    notesUseCase(
        CreateNoteUseCase,
        (d) =>
            new CreateNoteUseCase(
                d.repository,
                d.folderPreconditions,
                d.clock,
                d.publishing,
            ),
    ),
    notesUseCase(ListNotesUseCase, (d) => new ListNotesUseCase(d.repository)),
    notesUseCase(
        GetNoteUseCase,
        (d) => new GetNoteUseCase(d.preconditions, d.cards),
    ),
    mutation(RenameNoteUseCase),
    mutation(ShareNoteUseCase),
    revoking(MakeNotePrivateUseCase),
    revoking(DeleteNoteUseCase),
    notesUseCase(
        AuthorizeNoteDocumentUseCase,
        (d) => new AuthorizeNoteDocumentUseCase(d.preconditions),
    ),
    notesUseCase(
        LoadNoteDocumentUseCase,
        (d) => new LoadNoteDocumentUseCase(d.contents, d.preconditions),
    ),
    notesUseCase(
        SaveNoteDocumentUseCase,
        (d) => new SaveNoteDocumentUseCase(d.contents, d.clock),
    ),
    ...FOLDER_USE_CASES,
    ...CARD_USE_CASES,
];

// Decision 0006: the guard service reading pairing is a provider, injected where the couple of a request is needed.
const noteCoupleGuardService = {
    provide: NoteCoupleGuardService,
    inject: [PairedCoupleProvider],
    useFactory: (provider: PairedCoupleProvider) =>
        new NoteCoupleGuardService(provider),
};

@Module({
    imports: [NotesSecondaryModule],
    providers: [...useCases, noteCoupleGuardService],
    exports: [
        NotesSecondaryModule,
        ...useCases.map(({ provide }) => provide),
        NoteCoupleGuardService,
    ],
})
export class NotesServiceModule {}
