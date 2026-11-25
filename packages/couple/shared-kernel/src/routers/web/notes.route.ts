import type { RouteGroup } from '../route-group';

export const NotesRouteEnum = {
    NOTE_EDITOR: '/notes/:noteId',
    // R10: `space` is a NoteSpaceEnum value; the optional query `folderId` opens one of its folders.
    NOTE_SPACE: '/spaces/:space',
} as const satisfies RouteGroup;
