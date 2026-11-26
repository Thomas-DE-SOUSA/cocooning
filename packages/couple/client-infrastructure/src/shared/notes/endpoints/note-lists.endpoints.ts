import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type NoteListsEndpoints = {
    readonly lists: string;
    readonly list: (noteId: string) => string;
};

export function resolveNoteListsEndpoints(
    apiBaseUrl: string,
): NoteListsEndpoints {
    return {
        lists: resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_LIST_INDEX),
        list: (noteId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_LIST_EDIT, { noteId }),
    };
}
