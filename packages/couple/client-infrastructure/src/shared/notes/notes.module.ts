import {
    CreateFolderUseCase,
    CreateNoteUseCase,
    DeleteFolderUseCase,
    DeleteNoteUseCase,
    GetNoteSpaceContentsUseCase,
    GetNoteUseCase,
    ListNoteSpacesUseCase,
    ListNotesUseCase,
    MoveFolderUseCase,
    MoveNoteUseCase,
    RenameFolderUseCase,
    RenameNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveNoteFoldersEndpoints } from './endpoints/note-folders.endpoints';
import { resolveNotesEndpoints } from './endpoints/notes.endpoints';
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
    readonly renameFolder: RenameFolderUseCase;
    readonly moveFolder: MoveFolderUseCase;
    readonly deleteFolder: DeleteFolderUseCase;
    readonly moveNote: MoveNoteUseCase;
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
    return {
        listNotes: new ListNotesUseCase(notes),
        getNote: new GetNoteUseCase(notes),
        createNote: new CreateNoteUseCase(notes),
        renameNote: new RenameNoteUseCase(notes),
        deleteNote: new DeleteNoteUseCase(notes),
        listNoteSpaces: new ListNoteSpacesUseCase(folders),
        getNoteSpaceContents: new GetNoteSpaceContentsUseCase(folders),
        createFolder: new CreateFolderUseCase(folders),
        renameFolder: new RenameFolderUseCase(folders),
        moveFolder: new MoveFolderUseCase(folders),
        deleteFolder: new DeleteFolderUseCase(folders),
        moveNote: new MoveNoteUseCase(folders),
    };
}
