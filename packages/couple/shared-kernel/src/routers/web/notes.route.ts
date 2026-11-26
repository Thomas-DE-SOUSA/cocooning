import type { RouteGroup } from '../route-group';

export const NotesRouteEnum = {
    NOTE_EDITOR: '/notes/:noteId',
    // R10: `space` is a NoteSpaceEnum value; the optional query `folderId` opens one of its folders.
    NOTE_SPACE: '/spaces/:space',
    // R28: the Lists tab; the optional query `section` picks Courses, Tâches or Envies (decision 0058).
    NOTE_LISTS: '/lists',
    NOTE_LIST: '/lists/:noteId',
} as const satisfies RouteGroup;
