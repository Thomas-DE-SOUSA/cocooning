import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type NotesEndpoints = {
    readonly notes: string;
    readonly note: (noteId: string) => string;
    readonly share: (noteId: string) => string;
    readonly makePrivate: (noteId: string) => string;
};

export function resolveNotesEndpoints(apiBaseUrl: string): NotesEndpoints {
    return {
        notes: resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_LIST),
        note: (noteId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_RENAME, { noteId }),
        share: (noteId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_SHARE, { noteId }),
        makePrivate: (noteId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_MAKE_PRIVATE, {
                noteId,
            }),
    };
}
