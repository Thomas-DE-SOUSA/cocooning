import {
    CreateNoteUseCase,
    DeleteNoteUseCase,
    GetNoteUseCase,
    ListNotesUseCase,
    MakeNotePrivateUseCase,
    RenameNoteUseCase,
    ShareNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveNotesEndpoints } from './endpoints/notes.endpoints';
import { ApiNotesGateway } from './gateways/api-notes.gateway';

export type NotesModule = {
    readonly listNotes: ListNotesUseCase;
    readonly getNote: GetNoteUseCase;
    readonly createNote: CreateNoteUseCase;
    readonly renameNote: RenameNoteUseCase;
    readonly shareNote: ShareNoteUseCase;
    readonly makeNotePrivate: MakeNotePrivateUseCase;
    readonly deleteNote: DeleteNoteUseCase;
};

// The gateway stays inside; getSessionToken is only called when a use case runs (decision 0036).
export function createNotesModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): NotesModule {
    const gateway = new ApiNotesGateway(
        resolveNotesEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
        getSessionToken,
    );
    return {
        listNotes: new ListNotesUseCase(gateway),
        getNote: new GetNoteUseCase(gateway),
        createNote: new CreateNoteUseCase(gateway),
        renameNote: new RenameNoteUseCase(gateway),
        shareNote: new ShareNoteUseCase(gateway),
        makeNotePrivate: new MakeNotePrivateUseCase(gateway),
        deleteNote: new DeleteNoteUseCase(gateway),
    };
}
