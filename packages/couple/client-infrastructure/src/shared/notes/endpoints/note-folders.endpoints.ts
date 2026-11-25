import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type NoteFoldersEndpoints = {
    readonly spaces: string;
    readonly spaceContents: (space: NoteSpace) => string;
    readonly folders: string;
    readonly folder: (folderId: string) => string;
    readonly moveFolder: (folderId: string) => string;
    readonly moveNote: (noteId: string) => string;
};

export function resolveNoteFoldersEndpoints(
    apiBaseUrl: string,
): NoteFoldersEndpoints {
    const route = (path: string, params: Record<string, string> = {}) =>
        resolveRoute(apiBaseUrl, path, params);
    return {
        spaces: route(ApiRouterEnum.NOTE_SPACE_LIST),
        spaceContents: (space) =>
            route(ApiRouterEnum.NOTE_SPACE_CONTENTS_GET, { space }),
        folders: route(ApiRouterEnum.FOLDER_CREATE),
        folder: (folderId) => route(ApiRouterEnum.FOLDER_RENAME, { folderId }),
        moveFolder: (folderId) =>
            route(ApiRouterEnum.FOLDER_MOVE, { folderId }),
        moveNote: (noteId) => route(ApiRouterEnum.NOTE_MOVE, { noteId }),
    };
}
