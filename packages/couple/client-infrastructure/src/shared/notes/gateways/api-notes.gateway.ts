import {
    type HttpMethod,
    HttpMethodEnum,
    type HttpRequestConfig,
    parseResponse,
} from '@cocooning/client-infrastructure/shared/http';
import { NotesGateway } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CreateNoteRequest,
    CreateNoteRequestSchema,
    type NotePageResponse,
    NotePageResponseSchema,
    type NoteResponse,
    NoteResponseSchema,
    type RenameNoteRequest,
    RenameNoteRequestSchema,
} from '@cocooning/couple-contract/notes';
import type { OffsetPaginationQuery } from '@cocooning/couple-contract/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import { sessionRequest } from '../../session/session-request';
import type { NotesEndpoints } from '../endpoints/notes.endpoints';

const INVALID_TITLE: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Note title does not match its contract',
    backendCode: null,
};

const NO_BODY = null;

export class ApiNotesGateway extends NotesGateway {
    constructor(
        private readonly endpoints: NotesEndpoints,
        private readonly httpConfig: HttpRequestConfig<ApiError>,
        private readonly getSessionToken: SessionTokenProvider,
    ) {
        super();
    }

    override async listNotes({
        page,
        pageSize,
    }: OffsetPaginationQuery): Promise<Result<NotePageResponse, ApiError>> {
        const query = new URLSearchParams({
            page: String(page),
            pageSize: String(pageSize),
        });
        const result = await this.request(
            HttpMethodEnum.GET,
            `${this.endpoints.notes}?${query.toString()}`,
            NO_BODY,
        );
        return parseResponse(result, NotePageResponseSchema, this.httpConfig);
    }

    override createNote(
        request: CreateNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        const validated = CreateNoteRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(INVALID_TITLE));
        return this.note(
            HttpMethodEnum.POST,
            this.endpoints.notes,
            validated.data,
        );
    }

    override renameNote(
        noteId: string,
        request: RenameNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        const validated = RenameNoteRequestSchema.safeParse(request);
        if (!validated.success) return Promise.resolve(fail(INVALID_TITLE));
        return this.note(
            HttpMethodEnum.PATCH,
            this.endpoints.note(noteId),
            validated.data,
        );
    }

    override getNote(noteId: string): Promise<Result<NoteResponse, ApiError>> {
        return this.note(
            HttpMethodEnum.GET,
            this.endpoints.note(noteId),
            NO_BODY,
        );
    }

    override shareNote(
        noteId: string,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.note(
            HttpMethodEnum.POST,
            this.endpoints.share(noteId),
            NO_BODY,
        );
    }

    override makeNotePrivate(
        noteId: string,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.note(
            HttpMethodEnum.POST,
            this.endpoints.makePrivate(noteId),
            NO_BODY,
        );
    }

    // R7: the API answers 204 without a body.
    override async deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        const result = await this.request(
            HttpMethodEnum.DELETE,
            this.endpoints.note(noteId),
            NO_BODY,
        );
        return result.success ? ok(null) : result;
    }

    private async note(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<NoteResponse, ApiError>> {
        const result = await this.request(method, url, body);
        return parseResponse(result, NoteResponseSchema, this.httpConfig);
    }

    private request(
        method: HttpMethod,
        url: string,
        body: unknown,
    ): Promise<Result<unknown, ApiError>> {
        return sessionRequest(
            this.getSessionToken,
            { url, method, body },
            this.httpConfig,
        );
    }
}
