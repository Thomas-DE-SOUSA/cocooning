import type {
    CreateNoteListRequest,
    EditNoteListRequest,
    NoteListIndexResponse,
    NoteListResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { NoteListsGateway } from '../notes/domain/ports/note-lists.gateway';
import type { ApiError } from '../shared/api-error';
import { A_GROCERY_LIST, A_NOTE_LIST_INDEX } from './note-lists-fixtures';

export type NoteListsGatewayCall =
    | { readonly operation: 'listOf'; readonly kind: NoteListKind }
    | {
          readonly operation: 'create';
          readonly request: CreateNoteListRequest;
      }
    | {
          readonly operation: 'edit';
          readonly noteId: string;
          readonly request: EditNoteListRequest;
      };

// The fixtures answer every call, changed by the request, or one refusal does; a new list takes the visibility of its space (R11).
export class FakeNoteListsGateway extends NoteListsGateway {
    readonly calls: NoteListsGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override listOf(
        kind: NoteListKind,
    ): Promise<Result<NoteListIndexResponse, ApiError>> {
        return this.respond({ operation: 'listOf', kind }, A_NOTE_LIST_INDEX);
    }

    override create(
        request: CreateNoteListRequest,
    ): Promise<Result<NoteListResponse, ApiError>> {
        const { title, emoji, space } = request;
        return this.respond(
            { operation: 'create', request },
            {
                ...A_GROCERY_LIST,
                title,
                emoji,
                visibility: space,
                openItemCount: 0,
            },
        );
    }

    override edit(
        noteId: string,
        request: EditNoteListRequest,
    ): Promise<Result<NoteListResponse, ApiError>> {
        return this.respond(
            { operation: 'edit', noteId, request },
            { ...A_GROCERY_LIST, noteId, ...request },
        );
    }

    private respond<T>(
        call: NoteListsGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
