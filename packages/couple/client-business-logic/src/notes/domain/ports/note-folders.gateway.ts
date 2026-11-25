import type {
    CreateFolderRequest,
    FolderResponse,
    MoveFolderRequest,
    MoveNoteRequest,
    NoteResponse,
    NoteSpaceContentsResponse,
    NoteSpacesResponse,
    RenameFolderRequest,
} from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';

// Every call acts for the signed-in partner, like NotesGateway (decisions 0036, 0041); a null folder is the root of the space.
export abstract class NoteFoldersGateway {
    abstract listSpaces(): Promise<Result<NoteSpacesResponse, ApiError>>;
    abstract getSpaceContents(
        space: NoteSpace,
        folderId: string | null,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>>;
    abstract createFolder(
        request: CreateFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>>;
    abstract renameFolder(
        folderId: string,
        request: RenameFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>>;
    abstract moveFolder(
        folderId: string,
        request: MoveFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>>;
    abstract deleteFolder(folderId: string): Promise<Result<null, ApiError>>;
    abstract moveNote(
        noteId: string,
        request: MoveNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>>;
}
