import {
    type FolderResponse,
    FolderResponseSchema,
    type NoteSpaceContentsResponse,
    NoteSpaceContentsResponseSchema,
} from '@cocooning/couple-contract/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { TestClient, TestResponse } from '../shared/app/test-client';

type Space = 'SHARED' | 'PRIVATE';

const withFolder = (route: string, folderId: string): string =>
    route.replace(':folderId', folderId);

export const folderOf = (response: TestResponse): FolderResponse =>
    FolderResponseSchema.parse(response.body);

export const contentsOf = (response: TestResponse): NoteSpaceContentsResponse =>
    NoteSpaceContentsResponseSchema.parse(response.body);

// One method per route of the spaces and folders (R10 to R16), sent as a partner signed in at the clock of the test app.
export class FolderRequests {
    constructor(private readonly as: (userId: string) => TestClient) {}

    create(
        userId: string,
        name: string,
        space: Space = 'SHARED',
        parentFolderId: string | null = null,
    ): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.FOLDER_CREATE, {
            space,
            parentFolderId,
            name,
        });
    }

    async createdId(
        userId: string,
        name: string,
        space: Space = 'SHARED',
        parentFolderId: string | null = null,
    ): Promise<string> {
        return folderOf(await this.create(userId, name, space, parentFolderId))
            .folderId;
    }

    rename(
        userId: string,
        folderId: string,
        name: string,
    ): Promise<TestResponse> {
        return this.as(userId).patch(
            withFolder(ApiRouterEnum.FOLDER_RENAME, folderId),
            { name },
        );
    }

    move(
        userId: string,
        folderId: string,
        parentFolderId: string | null,
    ): Promise<TestResponse> {
        return this.as(userId).post(
            withFolder(ApiRouterEnum.FOLDER_MOVE, folderId),
            { parentFolderId },
        );
    }

    delete(userId: string, folderId: string): Promise<TestResponse> {
        return this.as(userId).delete(
            withFolder(ApiRouterEnum.FOLDER_DELETE, folderId),
        );
    }

    contents(
        userId: string,
        space: Space,
        folderId: string | null = null,
    ): Promise<TestResponse> {
        const route = ApiRouterEnum.NOTE_SPACE_CONTENTS_GET.replace(
            ':space',
            space,
        );
        const query = folderId === null ? '' : `?folderId=${folderId}`;
        return this.as(userId).get(`${route}${query}`);
    }

    spaces(userId: string): Promise<TestResponse> {
        return this.as(userId).get(ApiRouterEnum.NOTE_SPACE_LIST);
    }

    createNote(
        userId: string,
        title: string,
        space: Space,
        folderId: string | null,
    ): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.NOTE_CREATE, {
            title,
            space,
            folderId,
        });
    }

    moveNote(
        userId: string,
        noteId: string,
        space: Space,
        folderId: string | null,
    ): Promise<TestResponse> {
        return this.as(userId).post(
            ApiRouterEnum.NOTE_MOVE.replace(':noteId', noteId),
            { space, folderId },
        );
    }
}
