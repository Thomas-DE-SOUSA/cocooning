import type {
    CreateNoteRequest,
    NoteDetailResponse,
    NotePageResponse,
    NoteResponse,
    RenameNoteRequest,
} from '@cocooning/couple-contract/notes';
import type { OffsetPaginationQuery } from '@cocooning/couple-contract/shared';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { NotesGateway } from '../notes/domain/ports/notes.gateway';
import type { ApiError } from '../shared/api-error';

export type NotesGatewayCall =
    | { readonly operation: 'listNotes'; readonly query: OffsetPaginationQuery }
    | { readonly operation: 'createNote'; readonly request: CreateNoteRequest }
    | {
          readonly operation: 'renameNote';
          readonly noteId: string;
          readonly request: RenameNoteRequest;
      }
    | {
          readonly operation: 'getNote' | 'deleteNote';
          readonly noteId: string;
      };

export const A_SHARED_NOTE: NoteResponse = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000d1',
    ownerId: '01936b2e-7c4a-7000-8000-0000000000a1',
    isOwner: true,
    title: 'Courses',
    visibility: NoteVisibilityEnum.SHARED,
    folderId: null,
    updatedAt: '2026-11-23T08:00:00.000Z',
};

export const A_NOTE_PAGE: NotePageResponse = {
    items: [A_SHARED_NOTE],
    total: 1,
    page: 1,
    pageSize: 25,
};

// One page and one note answer every call, or one refusal does.
export class FakeNotesGateway extends NotesGateway {
    readonly calls: NotesGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override listNotes(
        query: OffsetPaginationQuery,
    ): Promise<Result<NotePageResponse, ApiError>> {
        return this.respond({ operation: 'listNotes', query }, A_NOTE_PAGE);
    }

    override getNote(
        noteId: string,
    ): Promise<Result<NoteDetailResponse, ApiError>> {
        return this.respond(
            { operation: 'getNote', noteId },
            { ...A_SHARED_NOTE, card: null },
        );
    }

    override createNote(
        request: CreateNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.respond(
            { operation: 'createNote', request },
            A_SHARED_NOTE,
        );
    }

    override renameNote(
        noteId: string,
        request: RenameNoteRequest,
    ): Promise<Result<NoteResponse, ApiError>> {
        return this.respond(
            { operation: 'renameNote', noteId, request },
            {
                ...A_SHARED_NOTE,
                title: request.title,
            },
        );
    }

    override deleteNote(noteId: string): Promise<Result<null, ApiError>> {
        return this.respond({ operation: 'deleteNote', noteId }, null);
    }

    private respond<T>(
        call: NotesGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
