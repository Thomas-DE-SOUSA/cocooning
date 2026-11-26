import {
    type NoteListResponse,
    NoteListResponseSchema,
} from '@cocooning/couple-contract/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';

type Kind = 'GROCERIES' | 'TASKS';
type Space = 'SHARED' | 'PRIVATE';

export const listOf = (response: TestResponse): NoteListResponse =>
    NoteListResponseSchema.parse(response.body);

// One method per route of the lists (R26 to R28), sent as a partner signed in at the clock of the test app.
export class ListRequests {
    constructor(private readonly as: (userId: string) => TestClient) {}

    index(userId: string, kind: string): Promise<TestResponse> {
        return this.as(userId).get(
            `${ApiRouterEnum.NOTE_LIST_INDEX}?kind=${kind}`,
        );
    }

    create(
        userId: string,
        title: string,
        space: Space = 'SHARED',
        kind: Kind = 'GROCERIES',
        emoji: string | null = '🛒',
    ): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.NOTE_LIST_CREATE, {
            kind,
            space,
            title,
            emoji,
        });
    }

    async createdListId(
        userId: string,
        title: string,
        space: Space = 'SHARED',
        kind: Kind = 'GROCERIES',
    ): Promise<string> {
        return listOf(await this.create(userId, title, space, kind)).noteId;
    }

    edit(
        userId: string,
        noteId: string,
        title: string,
        emoji: string | null,
    ): Promise<TestResponse> {
        return this.as(userId).patch(
            ApiRouterEnum.NOTE_LIST_EDIT.replace(':noteId', noteId),
            { title, emoji },
        );
    }
}
