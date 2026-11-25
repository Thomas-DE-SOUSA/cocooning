import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';

export type NotesEndpoints = {
    readonly notes: string;
    readonly note: (noteId: string) => string;
};

export function resolveNotesEndpoints(apiBaseUrl: string): NotesEndpoints {
    return {
        notes: resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_LIST),
        note: (noteId) =>
            resolveRoute(apiBaseUrl, ApiRouterEnum.NOTE_GET, { noteId }),
    };
}
