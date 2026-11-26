import {
    HttpMethodEnum,
    type HttpRequestConfig,
} from '@cocooning/client-infrastructure/shared/http';
import { NoteListsGateway } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CreateNoteListRequest,
    CreateNoteListRequestSchema,
    type EditNoteListRequest,
    EditNoteListRequestSchema,
    NoteListQueryRequestSchema,
} from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { fail } from '@cocooning/shared-kernel/utils';
import type { SessionTokenProvider } from '../../session/session-headers';
import type { NoteListsEndpoints } from '../endpoints/note-lists.endpoints';
import { asNoteList, asNoteListIndex } from './note-lists.responses';
import { NotesRequest } from './notes-request';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Note list request does not match its contract',
    backendCode: null,
};
const { GET, POST, PATCH } = HttpMethodEnum;

export class ApiNoteListsGateway extends NoteListsGateway {
    private readonly request: NotesRequest;

    constructor(
        private readonly endpoints: NoteListsEndpoints,
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

    // R28: the section goes in the query string, checked like the API reads it.
    override listOf(kind: NoteListKind) {
        const valid = NoteListQueryRequestSchema.safeParse({ kind });
        if (!valid.success) return Promise.resolve(fail(OUTSIDE_CONTRACT));
        const query = new URLSearchParams(valid.data).toString();
        const url = `${this.endpoints.lists}?${query}`;
        return this.request.send(GET, url, null, asNoteListIndex);
    }

    override create(request: CreateNoteListRequest) {
        const valid = CreateNoteListRequestSchema.safeParse(request);
        return this.request.sendValid(
            POST,
            this.endpoints.lists,
            valid,
            asNoteList,
        );
    }

    // R26: the title and the emoji, both sent again.
    override edit(noteId: string, request: EditNoteListRequest) {
        const valid = EditNoteListRequestSchema.safeParse(request);
        const url = this.endpoints.list(noteId);
        return this.request.sendValid(PATCH, url, valid, asNoteList);
    }
}
