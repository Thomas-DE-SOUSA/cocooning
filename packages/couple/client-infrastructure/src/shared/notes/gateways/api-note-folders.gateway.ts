import {
    HttpMethodEnum,
    type HttpRequestConfig,
} from '@cocooning/client-infrastructure/shared/http';
import { NoteFoldersGateway } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CreateFolderRequest,
    CreateFolderRequestSchema,
    type EditFolderTemplateRequest,
    EditFolderTemplateRequestSchema,
    type MoveFolderRequest,
    MoveFolderRequestSchema,
    type MoveNoteRequest,
    MoveNoteRequestSchema,
    type ProposeFolderTemplateRequest,
    ProposeFolderTemplateRequestSchema,
    type RenameFolderRequest,
    RenameFolderRequestSchema,
} from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import type { NoteFoldersEndpoints } from '../endpoints/note-folders.endpoints';
import {
    asFolder,
    asNote,
    asNoteSpaces,
    asSpaceContents,
    asTemplateProposal,
} from './note-folders.responses';
import { NotesRequest } from './notes-request';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Folder request does not match its contract',
    backendCode: null,
};
const { GET, POST, PUT, PATCH, DELETE } = HttpMethodEnum;

export class ApiNoteFoldersGateway extends NoteFoldersGateway {
    private readonly request: NotesRequest;

    constructor(
        private readonly endpoints: NoteFoldersEndpoints,
        httpConfig: HttpRequestConfig<ApiError>,
        getSessionToken: SessionTokenProvider,
    ) {
        super();
        this.request = new NotesRequest(
            httpConfig,
            getSessionToken,
            OUTSIDE_CONTRACT,
        );
    }

    override listSpaces() {
        return this.request.send(
            GET,
            this.endpoints.spaces,
            null,
            asNoteSpaces,
        );
    }

    // Without a folder, the API reads the root of the space.
    override getSpaceContents(space: NoteSpace, folderId: string | null) {
        const query =
            folderId === null
                ? ''
                : `?${new URLSearchParams({ folderId }).toString()}`;
        const url = `${this.endpoints.spaceContents(space)}${query}`;
        return this.request.send(GET, url, null, asSpaceContents);
    }

    override createFolder(request: CreateFolderRequest) {
        const valid = CreateFolderRequestSchema.safeParse(request);
        return this.request.sendValid(
            POST,
            this.endpoints.folders,
            valid,
            asFolder,
        );
    }

    override proposeFolderTemplate(request: ProposeFolderTemplateRequest) {
        const valid = ProposeFolderTemplateRequestSchema.safeParse(request);
        const url = this.endpoints.templateProposals;
        return this.request.sendValid(POST, url, valid, asTemplateProposal);
    }

    override editFolderTemplate(
        folderId: string,
        request: EditFolderTemplateRequest,
    ) {
        const valid = EditFolderTemplateRequestSchema.safeParse(request);
        const url = this.endpoints.folderTemplate(folderId);
        return this.request.sendValid(PUT, url, valid, asFolder);
    }

    override renameFolder(folderId: string, request: RenameFolderRequest) {
        const valid = RenameFolderRequestSchema.safeParse(request);
        const url = this.endpoints.folder(folderId);
        return this.request.sendValid(PATCH, url, valid, asFolder);
    }

    override moveFolder(folderId: string, request: MoveFolderRequest) {
        const valid = MoveFolderRequestSchema.safeParse(request);
        const url = this.endpoints.moveFolder(folderId);
        return this.request.sendValid(POST, url, valid, asFolder);
    }

    // R16: the API answers 204 without a body.
    override deleteFolder(folderId: string) {
        const url = this.endpoints.folder(folderId);
        return this.request.send(DELETE, url, null, (result) =>
            result.success ? ok(null) : result,
        );
    }

    override moveNote(noteId: string, request: MoveNoteRequest) {
        const valid = MoveNoteRequestSchema.safeParse(request);
        const url = this.endpoints.moveNote(noteId);
        return this.request.sendValid(POST, url, valid, asNote);
    }
}
