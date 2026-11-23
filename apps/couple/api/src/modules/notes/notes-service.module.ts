import { Module } from '@nestjs/common';
import {
    CreateNoteUseCase,
    DeleteNoteUseCase,
    ListNotesUseCase,
    MakeNotePrivateUseCase,
    NoteCoupleGuardService,
    PairedCoupleProvider,
    RenameNoteUseCase,
    ShareNoteUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { NotesSecondaryModule } from './notes-secondary.module';
import { notesUseCase } from './notes-use-case.factory';

const mutation = <T>(
    token: new (...args: ConstructorParameters<typeof RenameNoteUseCase>) => T,
) =>
    notesUseCase(
        token,
        (d) => new token(d.repository, d.preconditions, d.clock, d.publishing),
    );

const useCases = [
    notesUseCase(
        CreateNoteUseCase,
        (d) => new CreateNoteUseCase(d.repository, d.clock, d.publishing),
    ),
    notesUseCase(ListNotesUseCase, (d) => new ListNotesUseCase(d.repository)),
    mutation(RenameNoteUseCase),
    mutation(ShareNoteUseCase),
    mutation(MakeNotePrivateUseCase),
    mutation(DeleteNoteUseCase),
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
        ...useCases.map(({ provide }) => provide),
        NoteCoupleGuardService,
    ],
})
export class NotesServiceModule {}
