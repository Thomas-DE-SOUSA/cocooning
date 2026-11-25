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
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { NoteFoldersGateway } from '../notes/domain/ports/note-folders.gateway';
import type { ApiError } from '../shared/api-error';
import { A_SHARED_NOTE } from './fake-notes.gateway';
import {
    A_SHARED_FOLDER,
    A_SPACE_CONTENTS,
    THE_NOTE_SPACES,
} from './note-folders-fixtures';

type FolderCall<O, R> = {
    readonly operation: O;
    readonly folderId: string;
    readonly request: R;
};

export type NoteFoldersGatewayCall =
    | { readonly operation: 'listSpaces' }
    | {
          readonly operation: 'getSpaceContents';
          readonly space: NoteSpace;
          readonly folderId: string | null;
      }
    | {
          readonly operation: 'createFolder';
          readonly request: CreateFolderRequest;
      }
    | FolderCall<'renameFolder', RenameFolderRequest>
    | FolderCall<'moveFolder', MoveFolderRequest>
    | { readonly operation: 'deleteFolder'; readonly folderId: string }
    | {
          readonly operation: 'moveNote';
          readonly noteId: string;
          readonly request: MoveNoteRequest;
      };

// The fixtures answer every call, changed by the request, or one refusal does.
export class FakeNoteFoldersGateway extends NoteFoldersGateway {
    readonly calls: NoteFoldersGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override listSpaces(): Promise<Result<NoteSpacesResponse, ApiError>> {
        return this.respond({ operation: 'listSpaces' }, THE_NOTE_SPACES);
    }

    override getSpaceContents(
        space: NoteSpace,
        folderId: string | null,
    ): Promise<Result<NoteSpaceContentsResponse, ApiError>> {
        return this.respond(
            { operation: 'getSpaceContents', space, folderId },
            { ...A_SPACE_CONTENTS, space },
        );
    }

    override createFolder(
        request: CreateFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.respond(
            { operation: 'createFolder', request },
            { ...A_SHARED_FOLDER, ...request },
        );
    }

    override renameFolder(
        folderId: string,
        request: RenameFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.respond(
            { operation: 'renameFolder', folderId, request },
            { ...A_SHARED_FOLDER, folderId, name: request.name },
        );
    }

    override moveFolder(
        folderId: string,
        request: MoveFolderRequest,
    ): Promise<Result<FolderResponse, ApiError>> {
        return this.respond(
            { operation: 'moveFolder', folderId, request },
            { ...A_SHARED_FOLDER, folderId, ...request },
        );
    }

    override deleteFolder(folderId: string): Promise<Result<null, ApiError>> {
        return this.respond({ operation: 'deleteFolder', folderId }, null);
    }

    override moveNote(
        noteId: string,
        request: MoveNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.respond(
            { operation: 'moveNote', noteId, request },
            {
                ...A_SHARED_NOTE,
                noteId,
                visibility: request.space,
                folderId: request.folderId,
            },
        );
    }

    private respond<T>(
        call: NoteFoldersGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
