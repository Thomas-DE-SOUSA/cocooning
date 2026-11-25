import {
    type HttpMethod,
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
    type MoveFolderRequest,
    MoveFolderRequestSchema,
    type MoveNoteRequest,
    MoveNoteRequestSchema,
    type RenameFolderRequest,
    RenameFolderRequestSchema,
} from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { NoteFoldersEndpoints } from '../endpoints/note-folders.endpoints';
import {
    asFolder,
    asNote,
    asNoteSpaces,
    asSpaceContents,
    type ResponseParser,
} from './note-folders.responses';

type ValidatedRequest =
    | { readonly success: true; readonly data: unknown }
    | { readonly success: false };

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Folder request does not match its contract',
    backendCode: null,
};
const { GET, POST, PATCH, DELETE } = HttpMethodEnum;

export class ApiNoteFoldersGateway extends NoteFoldersGateway {
    constructor(
        private readonly endpoints: NoteFoldersEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override listSpaces() {
        return this.send(GET, this.endpoints.spaces, null, asNoteSpaces);
    }

    // Without a folder, the API reads the root of the space.
    override getSpaceContents(space: NoteSpace, folderId: string | null) {
        const query =
            folderId === null
                ? ''
                : `?${new URLSearchParams({ folderId }).toString()}`;
        const url = `${this.endpoints.spaceContents(space)}${query}`;
        return this.send(GET, url, null, asSpaceContents);
    }

    override createFolder(request: CreateFolderRequest) {
        const valid = CreateFolderRequestSchema.safeParse(request);
        return this.sendValid(POST, this.endpoints.folders, valid, asFolder);
    }

    override renameFolder(folderId: string, request: RenameFolderRequest) {
        const valid = RenameFolderRequestSchema.safeParse(request);
        const url = this.endpoints.folder(folderId);
        return this.sendValid(PATCH, url, valid, asFolder);
    }

    override moveFolder(folderId: string, request: MoveFolderRequest) {
        const valid = MoveFolderRequestSchema.safeParse(request);
        const url = this.endpoints.moveFolder(folderId);
        return this.sendValid(POST, url, valid, asFolder);
    }

    // R16: the API answers 204 without a body.
    override deleteFolder(folderId: string) {
        const url = this.endpoints.folder(folderId);
        return this.send(DELETE, url, null, (result) =>
            result.success ? ok(null) : result,
        );
    }

    override moveNote(noteId: string, request: MoveNoteRequest) {
        const valid = MoveNoteRequestSchema.safeParse(request);
        const url = this.endpoints.moveNote(noteId);
        return this.sendValid(POST, url, valid, asNote);
    }

    private sendValid<T>(
        method: HttpMethod,
        url: string,
        valid: ValidatedRequest,
        parse: ResponseParser<T>,
    ): Promise<Result<T, ApiError>> {
        if (!valid.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        return this.send(method, url, valid.data, parse);
    }

    private async send<T>(
        method: HttpMethod,
        url: string,
        body: unknown,
        parse: ResponseParser<T>,
    ): Promise<Result<T, ApiError>> {
        const request = { url, method, body };
        const result = await sessionRequest(
            this.getSessionToken,
            request,
            this.httpConfig,
        );
        return parse(result, this.httpConfig);
    }
}
