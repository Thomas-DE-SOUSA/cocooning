import {
    AddNoteCardUseCase,
    ChooseNoteCardCandidateUseCase,
    CorrectNoteCardFieldUseCase,
    CreateFolderUseCase,
    CreateNoteUseCase,
    DeleteFolderUseCase,
    DeleteNoteUseCase,
    EditFolderTemplateUseCase,
    GetNoteSpaceContentsUseCase,
    GetNoteUseCase,
    ListNoteSpacesUseCase,
    ListNotesUseCase,
    MoveFolderUseCase,
    MoveNoteUseCase,
    ProposeFolderTemplateUseCase,
    RefineNoteCardUseCase,
    RefreshNoteCardUseCase,
    RenameFolderUseCase,
    RenameNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveNoteCardsEndpoints } from './endpoints/note-cards.endpoints';
import { resolveNoteFoldersEndpoints } from './endpoints/note-folders.endpoints';
import { resolveNotesEndpoints } from './endpoints/notes.endpoints';
import { ApiNoteCardsGateway } from './gateways/api-note-cards.gateway';
import { ApiNoteFoldersGateway } from './gateways/api-note-folders.gateway';
import { ApiNotesGateway } from './gateways/api-notes.gateway';

export type NotesModule = {
    readonly listNotes: ListNotesUseCase;
    readonly getNote: GetNoteUseCase;
    readonly createNote: CreateNoteUseCase;
    readonly renameNote: RenameNoteUseCase;
    readonly deleteNote: DeleteNoteUseCase;
    readonly listNoteSpaces: ListNoteSpacesUseCase;
    readonly getNoteSpaceContents: GetNoteSpaceContentsUseCase;
    readonly createFolder: CreateFolderUseCase;
    readonly proposeFolderTemplate: ProposeFolderTemplateUseCase;
    readonly editFolderTemplate: EditFolderTemplateUseCase;
    readonly renameFolder: RenameFolderUseCase;
    readonly moveFolder: MoveFolderUseCase;
    readonly deleteFolder: DeleteFolderUseCase;
    readonly moveNote: MoveNoteUseCase;
    readonly addNoteCard: AddNoteCardUseCase;
    readonly chooseNoteCardCandidate: ChooseNoteCardCandidateUseCase;
    readonly refineNoteCard: RefineNoteCardUseCase;
    readonly refreshNoteCard: RefreshNoteCardUseCase;
    readonly correctNoteCardField: CorrectNoteCardFieldUseCase;
};

// The gateways stay inside; getSessionToken is only called when a use case runs (decision 0036).
export function createNotesModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): NotesModule {
    const httpConfig = createCoupleHttpConfig(timeoutMs);
    const notes = new ApiNotesGateway(
        resolveNotesEndpoints(apiBaseUrl),
        httpConfig,
        getSessionToken,
    );
    const folders = new ApiNoteFoldersGateway(
        resolveNoteFoldersEndpoints(apiBaseUrl),
        httpConfig,
        getSessionToken,
    );
    const cards = new ApiNoteCardsGateway(
        resolveNoteCardsEndpoints(apiBaseUrl),
        httpConfig,
        getSessionToken,
    );
    return {
        listNotes: new ListNotesUseCase(notes),
        getNote: new GetNoteUseCase(notes),
        createNote: new CreateNoteUseCase(notes),
        renameNote: new RenameNoteUseCase(notes),
        deleteNote: new DeleteNoteUseCase(notes),
        listNoteSpaces: new ListNoteSpacesUseCase(folders),
        getNoteSpaceContents: new GetNoteSpaceContentsUseCase(folders),
        createFolder: new CreateFolderUseCase(folders),
        proposeFolderTemplate: new ProposeFolderTemplateUseCase(folders),
        editFolderTemplate: new EditFolderTemplateUseCase(folders),
        renameFolder: new RenameFolderUseCase(folders),
        moveFolder: new MoveFolderUseCase(folders),
        deleteFolder: new DeleteFolderUseCase(folders),
        moveNote: new MoveNoteUseCase(folders),
        addNoteCard: new AddNoteCardUseCase(cards),
        chooseNoteCardCandidate: new ChooseNoteCardCandidateUseCase(cards),
        refineNoteCard: new RefineNoteCardUseCase(cards),
        refreshNoteCard: new RefreshNoteCardUseCase(cards),
        correctNoteCardField: new CorrectNoteCardFieldUseCase(cards),
    };
}
