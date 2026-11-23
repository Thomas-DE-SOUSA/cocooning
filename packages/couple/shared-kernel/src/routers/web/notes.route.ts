import type { RouteGroup } from '../route-group';

export const NotesRouteEnum = {
    NOTE_EDITOR: '/notes/:noteId',
} as const satisfies RouteGroup;
