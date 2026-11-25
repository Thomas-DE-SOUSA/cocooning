import {
    HttpMethodEnum,
    type HttpRequestConfig,
} from '@cocooning/client-infrastructure/shared/http';
import { NoteCardsGateway } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type AddNoteCardRequest,
    AddNoteCardRequestSchema,
    type ChooseNoteCardCandidateRequest,
    ChooseNoteCardCandidateRequestSchema,
    type CorrectNoteCardFieldRequest,
    CorrectNoteCardFieldRequestSchema,
    type RefineNoteCardRequest,
    RefineNoteCardRequestSchema,
} from '@cocooning/couple-contract/notes';
import type { SessionTokenProvider } from '../../session/session-headers';
import type { NoteCardsEndpoints } from '../endpoints/note-cards.endpoints';
import { asNoteCard, asNoteDetail } from './note-cards.responses';
import { NotesRequest } from './notes-request';

const OUTSIDE_CONTRACT: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Note card request does not match its contract',
    backendCode: null,
};
const { POST, PUT } = HttpMethodEnum;

export class ApiNoteCardsGateway extends NoteCardsGateway {
    private readonly request: NotesRequest;

    constructor(
        private readonly endpoints: NoteCardsEndpoints,
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

    override addNoteCard(folderId: string, request: AddNoteCardRequest) {
        const valid = AddNoteCardRequestSchema.safeParse(request);
        const url = this.endpoints.folderCards(folderId);
        return this.request.sendValid(POST, url, valid, asNoteDetail);
    }

    override chooseNoteCardCandidate(
        noteId: string,
        request: ChooseNoteCardCandidateRequest,
    ) {
        const valid = ChooseNoteCardCandidateRequestSchema.safeParse(request);
        const url = this.endpoints.chooseCandidate(noteId);
        return this.request.sendValid(POST, url, valid, asNoteCard);
    }

    override refineNoteCard(noteId: string, request: RefineNoteCardRequest) {
        const valid = RefineNoteCardRequestSchema.safeParse(request);
        const url = this.endpoints.refine(noteId);
        return this.request.sendValid(POST, url, valid, asNoteCard);
    }

    override refreshNoteCard(noteId: string) {
        const url = this.endpoints.refresh(noteId);
        return this.request.send(POST, url, null, asNoteCard);
    }

    override correctNoteCardField(
        noteId: string,
        request: CorrectNoteCardFieldRequest,
    ) {
        const valid = CorrectNoteCardFieldRequestSchema.safeParse(request);
        const url = this.endpoints.fields(noteId);
        return this.request.sendValid(PUT, url, valid, asNoteCard);
    }
}
