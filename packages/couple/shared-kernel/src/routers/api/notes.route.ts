import type { RouteGroup } from '../route-group';

// Create and list share one path, rename and delete another: the HTTP verb tells them apart.
export const NotesRouteEnum = {
    NOTE_CREATE: '/notes',
    NOTE_LIST: '/notes',
    NOTE_RENAME: '/notes/:noteId',
    NOTE_DELETE: '/notes/:noteId',
    NOTE_SHARE: '/notes/:noteId/share',
    NOTE_MAKE_PRIVATE: '/notes/:noteId/make-private',
} as const satisfies RouteGroup;
