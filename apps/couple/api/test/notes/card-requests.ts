import {
    type NoteCardResponse,
    NoteCardResponseSchema,
    type NoteDetailResponse,
    NoteDetailResponseSchema,
} from '@cocooning/couple-contract/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';

const withNote = (route: string, noteId: string): string =>
    route.replace(':noteId', noteId);

export const noteDetailOf = (response: TestResponse): NoteDetailResponse =>
    NoteDetailResponseSchema.parse(response.body);

export const cardOf = (response: TestResponse): NoteCardResponse =>
    NoteCardResponseSchema.parse(response.body);

// One method per route of the cards (R19 to R22), sent as a partner signed in at the clock of the test app.
export class CardRequests {
    constructor(private readonly as: (userId: string) => TestClient) {}

    add(userId: string, folderId: string, name: string): Promise<TestResponse> {
        return this.as(userId).post(
            ApiRouterEnum.NOTE_CARD_ADD.replace(':folderId', folderId),
            { name },
        );
    }

    choose(
        userId: string,
        noteId: string,
        candidateIndex: number,
    ): Promise<TestResponse> {
        return this.as(userId).post(
            withNote(ApiRouterEnum.NOTE_CARD_CANDIDATE_CHOOSE, noteId),
            { candidateIndex },
        );
    }

    refine(
        userId: string,
        noteId: string,
        query: string,
    ): Promise<TestResponse> {
        return this.as(userId).post(
            withNote(ApiRouterEnum.NOTE_CARD_REFINE, noteId),
            { query },
        );
    }

    refresh(userId: string, noteId: string): Promise<TestResponse> {
        return this.as(userId).post(
            withNote(ApiRouterEnum.NOTE_CARD_REFRESH, noteId),
        );
    }

    correct(
        userId: string,
        noteId: string,
        name: string,
        value: string,
    ): Promise<TestResponse> {
        return this.as(userId).put(
            withNote(ApiRouterEnum.NOTE_CARD_FIELD_CORRECT, noteId),
            { name, value },
        );
    }
}
