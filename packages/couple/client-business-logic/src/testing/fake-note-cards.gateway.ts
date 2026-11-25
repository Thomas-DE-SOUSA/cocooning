import type {
    AddNoteCardRequest,
    ChooseNoteCardCandidateRequest,
    CorrectNoteCardFieldRequest,
    NoteCardResponse,
    NoteDetailResponse,
    RefineNoteCardRequest,
} from '@cocooning/couple-contract/notes';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { NoteCardsGateway } from '../notes/domain/ports/note-cards.gateway';
import type { ApiError } from '../shared/api-error';
import { A_SHARED_NOTE } from './fake-notes.gateway';
import { A_FILLED_NOTE_CARD, A_PENDING_NOTE_CARD } from './note-cards-fixtures';

type CardCall<O, R> = {
    readonly operation: O;
    readonly noteId: string;
    readonly request: R;
};

export type NoteCardsGatewayCall =
    | {
          readonly operation: 'addNoteCard';
          readonly folderId: string;
          readonly request: AddNoteCardRequest;
      }
    | CardCall<'chooseNoteCardCandidate', ChooseNoteCardCandidateRequest>
    | CardCall<'refineNoteCard', RefineNoteCardRequest>
    | { readonly operation: 'refreshNoteCard'; readonly noteId: string }
    | CardCall<'correctNoteCardField', CorrectNoteCardFieldRequest>;

// The card fixtures answer every call, changed by the request, or one refusal does.
export class FakeNoteCardsGateway extends NoteCardsGateway {
    readonly calls: NoteCardsGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override addNoteCard(
        folderId: string,
        request: AddNoteCardRequest,
    ): Promise<Result<NoteDetailResponse, ApiError>> {
        const card = { ...A_PENDING_NOTE_CARD, query: request.name };
        return this.respond(
            { operation: 'addNoteCard', folderId, request },
            {
                ...A_SHARED_NOTE,
                noteId: card.noteId,
                title: request.name,
                folderId,
                card,
            },
        );
    }

    override chooseNoteCardCandidate(
        noteId: string,
        request: ChooseNoteCardCandidateRequest,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.respond(
            { operation: 'chooseNoteCardCandidate', noteId, request },
            { ...A_PENDING_NOTE_CARD, noteId },
        );
    }

    override refineNoteCard(
        noteId: string,
        request: RefineNoteCardRequest,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.respond(
            { operation: 'refineNoteCard', noteId, request },
            { ...A_PENDING_NOTE_CARD, noteId, query: request.query },
        );
    }

    override refreshNoteCard(
        noteId: string,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        return this.respond(
            { operation: 'refreshNoteCard', noteId },
            { ...A_PENDING_NOTE_CARD, noteId },
        );
    }

    override correctNoteCardField(
        noteId: string,
        request: CorrectNoteCardFieldRequest,
    ): Promise<Result<NoteCardResponse, ApiError>> {
        const fields = A_FILLED_NOTE_CARD.fields.map((field) =>
            field.name === request.name
                ? { ...request, isManual: true }
                : field,
        );
        return this.respond(
            { operation: 'correctNoteCardField', noteId, request },
            { ...A_FILLED_NOTE_CARD, noteId, fields },
        );
    }

    private respond<T>(
        call: NoteCardsGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
